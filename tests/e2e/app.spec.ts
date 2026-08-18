import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("#/progress");
  await page.evaluate(() => localStorage.clear());
});

test("a new learner completes a lesson and keeps progress after reload", async ({ page }) => {
  await page.goto("#/learn/b01-introduction");
  await expect(page.getByRole("heading", { name: "快速认识掼蛋" })).toBeVisible();
  await page.getByLabel("正对面玩家").focus();
  await page.keyboard.press("Space");
  await page.locator("section.quiz").first().getByRole("button", { name: "提交答案" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("判断正确");
  const lessonQuizzes = page.locator("section.quiz");
  for (let index = 1; index < await lessonQuizzes.count(); index += 1) {
    const quiz = lessonQuizzes.nth(index);
    await quiz.locator("input[type=radio]").first().check();
    await quiz.getByRole("button", { name: "提交答案" }).click();
  }
  await page.getByRole("button", { name: "完成本节" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: /已完成本节/ })).toBeDisabled();
});

test("lesson navigation starts the next lesson at the top", async ({ page }) => {
  await page.goto("#/learn/b01-introduction");
  await page.locator(".lesson-nav").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.locator(".lesson-nav a").last().click();
  await expect(page.getByRole("heading", { name: /牌型与大小/ })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("filtered training writes skill progress", async ({ page }) => {
  await page.goto("#/train?skillId=control");
  await expect(page.getByLabel("知识标签")).toHaveValue("control");
  await page.getByRole("button", { name: /开始训练/ }).click();
  await page.locator(".quiz-option input").first().check();
  await page.getByRole("button", { name: "第 2 题，未作答" }).click();
  await page.getByRole("button", { name: "第 1 题，待提交" }).click();
  await expect(page.locator(".quiz-option input").first()).toBeChecked();

  const totalQuestions = await page.locator(".question-index-list button").count();
  for (let index = 0; index < totalQuestions; index += 1) {
    await page.locator(".question-index-list button").nth(index).click();
    await page.locator(".quiz-option input").first().check();
    await page.getByRole("button", { name: "提交答案" }).click();
    const next = page.getByRole("button", { name: index === totalQuestions - 1 ? "查看结果" : "下一题" });
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
        "b01-quick-goal": "opposite", "b01-quick-level": "h7", "b01-quick-type-compare": "a", "b02-basic-type": "triple-two",
        "b02-pair-compare": "a", "b02-straight-compare": "a", "b03-round-compare": "a", "b03-tribute-decision": "single",
        "b03-turn-choice": "pass", "b04-bomb-choice": "four", "b04-leveling": "rank",
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
    await expect(page.getByRole("heading", { name: "一局与升级" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-lesson.png`), fullPage: true });
    await page.reload();
    await expect(page.getByRole("heading", { name: "一局与升级" })).toBeVisible();
  }
});

test("question workspace is stable on desktop and usable above mobile navigation", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/train/session");
  await expect(page.locator(".question-index")).toBeVisible();
  const desktopRegions = await page.locator(".question-index, .session-question-pane, .session-feedback-pane").evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().x));
  expect(desktopRegions[0]).toBeLessThan(desktopRegions[1]);
  expect(desktopRegions[1]).toBeLessThan(desktopRegions[2]);
  const controlsBefore = await page.locator(".session-controls").boundingBox();
  await page.locator(".quiz-option input").first().check();
  await page.getByRole("button", { name: "提交答案" }).click();
  const controlsAfter = await page.locator(".session-controls").boundingBox();
  expect(controlsAfter?.y).toBe(controlsBefore?.y);
  await expect(page.locator(".session-controls")).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath("desktop-training-workspace.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/train/session");
  await expect(page.locator(".question-index-list")).toBeVisible();
  await expect(page.locator(".session-controls")).toBeInViewport();
  const mobileGeometry = await page.evaluate(() => {
    const controls = document.querySelector(".session-controls")!.getBoundingClientRect();
    const navigation = document.querySelector(".mobile-nav")!.getBoundingClientRect();
    return { controlsBottom: controls.bottom, navigationTop: navigation.top, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  });
  expect(mobileGeometry.controlsBottom).toBeLessThanOrEqual(mobileGeometry.navigationTop + 1);
  expect(mobileGeometry.overflow).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("mobile-training-workspace.png"), fullPage: true });
});
