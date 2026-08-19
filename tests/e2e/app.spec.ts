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

test("lesson reading layout provides directory and chapter navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/learn/b01-introduction");
  await expect(page.locator(".lesson-directory-shell")).toBeVisible();
  await expect(page.locator(".lesson-section-nav-shell")).toBeVisible();
  await expect(page.getByRole("link", { name: /快速认识掼蛋/ }).first()).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".lesson-section-nav a").first()).toHaveText("先记住四句话");

  await page.locator(".lesson-section-nav a").nth(1).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.locator(".lesson-content h2").nth(1).scrollIntoViewIfNeeded();
  await expect(page.locator(".lesson-section-nav a").nth(1)).toHaveClass(/active/);
});

test("desktop lesson sidebars stay visible while the page scrolls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/learn/b01-introduction");
  await expect(page.getByRole("heading", { name: "快速认识掼蛋" })).toBeVisible();
  const sidebars = page.locator(".lesson-directory, .lesson-section-nav");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.body.scrollHeight);
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  const geometry = await sidebars.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, height: rect.height, overflow: element.scrollHeight > element.clientHeight };
  }));
  for (const sidebar of geometry) {
    expect(sidebar.top).toBeGreaterThanOrEqual(100);
    expect(sidebar.bottom).toBeGreaterThan(100);
    expect(sidebar.height).toBeGreaterThan(0);
  }
  expect(geometry[0].overflow).toBe(false);
  expect(geometry[1].overflow).toBe(false);
});

test("mobile lesson tools open and close directory drawers", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/learn/b01-introduction");
  await page.getByRole("button", { name: "课程目录" }).click();
  await expect(page.getByRole("dialog", { name: "课程目录" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "课程目录" }).click();
  await page.getByRole("dialog", { name: "课程目录" }).getByRole("link", { name: /牌型与大小/ }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "牌型与大小" })).toBeVisible();

  await page.getByRole("button", { name: "章节导航" }).click();
  await expect(page.getByRole("dialog", { name: "章节导航" })).toBeVisible();
  await page.getByRole("dialog", { name: "章节导航" }).getByRole("link", { name: "炸弹和同花顺" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("mobile lesson tools stay available while reading", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/learn/b01-introduction");
  await expect(page.getByRole("heading", { name: "快速认识掼蛋" })).toBeVisible();

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.body.scrollHeight);
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  const geometry = await page.evaluate(() => {
    const toolbar = document.querySelector(".lesson-mobile-tools")!.getBoundingClientRect();
    const topbar = document.querySelector(".topbar")!.getBoundingClientRect();
    const mobileNav = document.querySelector(".mobile-nav")!.getBoundingClientRect();
    return { toolbarTop: toolbar.top, toolbarBottom: toolbar.bottom, topbarBottom: topbar.bottom, mobileNavTop: mobileNav.top, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  });
  expect(geometry.toolbarTop).toBeGreaterThanOrEqual(geometry.topbarBottom - 1);
  expect(geometry.toolbarTop).toBeLessThanOrEqual(geometry.topbarBottom + 1);
  expect(geometry.toolbarBottom).toBeLessThanOrEqual(geometry.mobileNavTop);
  expect(geometry.overflow).toBe(false);

  await page.getByRole("button", { name: "课程目录" }).click();
  await expect(page.getByRole("dialog", { name: "课程目录" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.getByRole("button", { name: "章节导航" }).click();
  const chapterDialog = page.getByRole("dialog", { name: "章节导航" });
  await expect(chapterDialog).toBeVisible();
  await chapterDialog.getByRole("link", { name: "新手先建立三个习惯" }).click();
  await expect(chapterDialog).not.toBeVisible();

  const heading = page.getByRole("heading", { name: "新手先建立三个习惯" });
  await expect.poll(() => page.evaluate(() => {
    const target = [...document.querySelectorAll(".lesson-content h2")].find((element) => element.textContent?.trim() === "新手先建立三个习惯")?.getBoundingClientRect();
    const toolbar = document.querySelector(".lesson-mobile-tools")?.getBoundingClientRect();
    return target && toolbar ? target.top - toolbar.bottom : Number.NEGATIVE_INFINITY;
  })).toBeGreaterThanOrEqual(-1);
  await expect(heading).toBeVisible();
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
