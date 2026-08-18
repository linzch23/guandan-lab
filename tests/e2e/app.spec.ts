import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("#/progress");
  await page.evaluate(() => localStorage.clear());
});

test("a new learner completes a lesson and keeps progress after reload", async ({ page }) => {
  await page.goto("#/learn/b01-introduction");
  await expect(page.getByRole("heading", { name: "认识掼蛋与胜负目标" })).toBeVisible();
  await page.getByLabel("与你相对而坐的玩家").focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "提交答案" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("判断正确");
  await page.getByRole("button", { name: "完成本节" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: /已完成本节/ })).toBeDisabled();
});

test("filtered training writes skill progress", async ({ page }) => {
  await page.goto("#/train?skillId=control");
  await expect(page.getByLabel("知识标签")).toHaveValue("control");
  await page.getByRole("button", { name: /开始训练/ }).click();
  for (let index = 0; index < 3; index += 1) {
    await page.locator(".quiz-option input").first().check();
    await page.getByRole("button", { name: "提交答案" }).click();
    const next = page.getByRole("button", { name: index === 2 ? "查看结果" : "下一题" });
    await next.click();
  }
  await page.getByRole("link", { name: "查看进度" }).click();
  await expect(page.getByText("牌权与过牌", { exact: true })).toBeVisible();
});

test("assessment enforces the 80 percent boundary", async ({ page }) => {
  const answerRun = async (correctCount: number) => {
    for (let index = 0; index < 10; index += 1) {
      const quiz = page.locator("section.quiz");
      const id = (await quiz.getAttribute("data-quiz-id"))!;
      const answerMap: Record<string, string> = {
        "b01-goal": "opposite", "b02-level-card": "twenty-seven", "b02-wildcard-compare": "level", "b03-type": "full", "b03-straight-compare": "queen-high",
        "b04-bomb-rule": "four", "b05-ranking-one": "level", "b06-follow": "higher-pair", "b07-tribute": "previous-rank", "b08-leveling": "best",
      };
      const correct = answerMap[id];
      const options = quiz.locator("input[type=radio]");
      if (index < correctCount) await quiz.locator(`input[value="${correct}"]`).check();
      else {
        const count = await options.count();
        for (let optionIndex = 0; optionIndex < count; optionIndex += 1) {
          const option = options.nth(optionIndex);
          if (await option.getAttribute("value") !== correct) { await option.check(); break; }
        }
      }
      await page.getByRole("button", { name: "提交答案" }).click();
      await page.getByRole("button", { name: index === 9 ? "查看结果" : "下一题" }).click();
    }
  };

  await page.goto("#/assessment/beginner");
  await answerRun(7);
  await expect(page.getByRole("heading", { name: "还差一点" })).toBeVisible();
  await page.reload();
  await answerRun(8);
  await expect(page.getByRole("heading", { name: "通过结业测验" })).toBeVisible();
});

test("reset clears all local learning data", async ({ page }) => {
  await page.goto("#/progress");
  await page.evaluate(() => localStorage.setItem("guandan-lab.progress.v1", JSON.stringify({ schemaVersion: 1, completedLessonIds: ["b01-introduction"], questions: {}, assessments: {} })));
  await page.reload();
  await page.getByRole("button", { name: "清空进度" }).click();
  await page.getByRole("button", { name: "确定" }).click();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("guandan-lab.progress.v1") || "{}"));
  expect(stored.completedLessonIds).toEqual([]);
});

test("hash deep links render without horizontal overflow on mobile and desktop", async ({ page }, testInfo) => {
  for (const viewport of [{ width: 390, height: 844, name: "mobile" }, { width: 1440, height: 900, name: "desktop" }]) {
    await page.setViewportSize(viewport);
    await page.goto("#/learn/b04-bombs-special");
    await expect(page.getByRole("heading", { name: "炸弹与特殊牌型" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-lesson.png`), fullPage: true });
    await page.reload();
    await expect(page.getByRole("heading", { name: "炸弹与特殊牌型" })).toBeVisible();
  }
});
