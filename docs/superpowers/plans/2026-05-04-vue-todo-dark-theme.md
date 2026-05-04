# Vue Todo Dark Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有待办提醒页面整体改造成统一的黑暗系视觉风格，同时保持现有交互和提醒逻辑不变。

**Architecture:** 以 `app/src/style.css` 为主要改动面，统一全局颜色变量、背景、面板、Hero、表单、按钮与待办状态卡样式。仅在 `app/src/App.vue` 中进行必要且轻量的结构增强，以支持更完整的暗色视觉层次，不触碰业务逻辑。

**Tech Stack:** Vue 3, Vite, JavaScript, CSS

---

## File Structure

- Modify: `app/src/style.css`
  - 负责定义全局暗色主题、背景、Hero、统计卡、面板、表单、按钮、空状态、待办卡与响应式样式
- Modify: `app/src/App.vue`
  - 负责在不影响逻辑的前提下，补充少量结构类名或装饰容器，支撑暗色 Hero 和布局细节

### Task 1: Audit Existing Markup Hooks

**Files:**
- Modify: `app/src/App.vue`
- Test: 浏览器预览 `http://localhost:5173/`

- [ ] **Step 1: Review current template structure and identify whether extra wrappers are needed**

```vue
<section class="hero-panel">
  <p class="eyebrow">Vue To-do Reminder</p>
  <div class="hero-title-wrap">
    <span class="hero-seal">卷一</span>
    <h1>待办清卷</h1>
    <p class="hero-subtitle">把待办放进一个会按时提醒你的清爽小工具里</p>
  </div>
</section>
```

- [ ] **Step 2: If needed, add only minimal presentational wrappers or classes without changing any reactive bindings**

```vue
<section class="hero-panel">
  <div class="hero-glow" aria-hidden="true"></div>
  <p class="eyebrow">Vue To-do Reminder</p>
</section>
```

- [ ] **Step 3: Verify the page still renders before any CSS overhaul**

Run: `npm run build`
Expected: build succeeds with no Vue template errors

### Task 2: Rebuild Global Theme Foundation

**Files:**
- Modify: `app/src/style.css`
- Test: 浏览器预览 `http://localhost:5173/`

- [ ] **Step 1: Replace the current light theme root tokens with dark-theme foundation values**

```css
:root {
  font-family: "Segoe UI", "PingFang SC", "Hiragino Sans GB", sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: #e6eef8;
  background:
    radial-gradient(circle at top, rgba(56, 189, 248, 0.16), transparent 28%),
    radial-gradient(circle at 85% 15%, rgba(34, 211, 238, 0.1), transparent 18%),
    linear-gradient(180deg, #07111f 0%, #0b1320 46%, #050814 100%);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}
```

- [ ] **Step 2: Update body, app shell, and shared panel styling to use the dark glass-card system**

```css
body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  color: #e6eef8;
}

.hero-panel,
.panel {
  background: rgba(8, 15, 29, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 28px;
  box-shadow: 0 24px 80px rgba(2, 8, 23, 0.45);
  backdrop-filter: blur(18px);
}
```

- [ ] **Step 3: Visually verify the page background and primary panels now read as a coherent dark interface**

Run: `npm run dev`
Expected: page loads with dark background and panels remain readable

### Task 3: Restyle Hero And Summary Cards

**Files:**
- Modify: `app/src/style.css`
- Modify: `app/src/App.vue` (only if extra decorative wrapper/class is required)
- Test: 浏览器预览 `http://localhost:5173/`

- [ ] **Step 1: Convert the Hero from parchment styling to dark dashboard styling**

```css
.hero-panel {
  position: relative;
  overflow: hidden;
  padding: 38px;
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.16), transparent 24%),
    linear-gradient(145deg, rgba(10, 18, 32, 0.96), rgba(5, 10, 20, 0.92));
}

.hero-panel h1 {
  color: #f8fbff;
  background: none;
  -webkit-background-clip: initial;
  background-clip: initial;
  text-shadow: 0 12px 36px rgba(34, 211, 238, 0.16);
}
```

- [ ] **Step 2: Restyle eyebrow, subtitle, supporting copy, and summary cards to match the dark system**

```css
.eyebrow,
.section-kicker {
  color: #67e8f9;
}

.stat-card {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(9, 14, 28, 0.88));
  border: 1px solid rgba(103, 232, 249, 0.12);
}
```

- [ ] **Step 3: Verify Hero remains visually distinct from the lower panels without reverting to a light theme**

Run: `npm run build`
Expected: build succeeds and visual hierarchy is preserved in preview

### Task 4: Restyle Forms, Buttons, And Inline Messaging

**Files:**
- Modify: `app/src/style.css`
- Test: 浏览器预览 `http://localhost:5173/`

- [ ] **Step 1: Convert form fields to dark inputs with clear focus states**

```css
.todo-form input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.9);
  color: #f8fbff;
}

.todo-form input:focus {
  outline: 2px solid rgba(34, 211, 238, 0.65);
  border-color: transparent;
}
```

- [ ] **Step 2: Redesign primary, secondary, and text buttons for dark-mode contrast**

```css
.primary-button {
  background: linear-gradient(135deg, #0891b2, #2563eb);
  color: #f8fbff;
}

.secondary-button {
  background: rgba(15, 23, 42, 0.84);
  color: #c8f3ff;
  border: 1px solid rgba(103, 232, 249, 0.2);
}
```

- [ ] **Step 3: Update inline message and empty state styling so alerts remain readable on dark backgrounds**

Run: `npm run build`
Expected: build succeeds and all callout areas remain legible

### Task 5: Restyle Todo Cards, Badges, And Responsive Details

**Files:**
- Modify: `app/src/style.css`
- Test: 浏览器预览 `http://localhost:5173/`

- [ ] **Step 1: Rework todo cards and status variants for dark mode**

```css
.todo-card {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(9, 14, 28, 0.94));
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.todo-card.soon {
  border-color: rgba(56, 189, 248, 0.42);
  box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.08);
}

.todo-card.overdue {
  border-color: rgba(251, 113, 133, 0.38);
  background: linear-gradient(180deg, rgba(47, 16, 24, 0.86), rgba(24, 8, 14, 0.94));
}
```

- [ ] **Step 2: Update status badge, metadata text, and completed-state contrast**

```css
.status-badge {
  background: rgba(8, 145, 178, 0.16);
  color: #9be8ff;
}

.todo-card.completed {
  opacity: 0.62;
}
```

- [ ] **Step 3: Recheck responsive behavior for stacked cards and mobile spacing**

Run: `npm run build`
Expected: build succeeds and mobile layout still collapses cleanly below 900px

### Task 6: Final Verification

**Files:**
- Modify: `app/src/style.css`
- Modify: `app/src/App.vue`

- [ ] **Step 1: Run a production build after all visual changes**

Run: `npm run build`
Expected: `dist/` generated successfully with no errors

- [ ] **Step 2: Manually verify the main user journey in the browser**

Run: 在 `http://localhost:5173/` 检查以下内容
Expected:
- 页面整体为统一黑暗风格
- 可以输入标题和截止时间
- 按钮、表单、列表、空状态都具有良好可读性
- 待办卡的普通、即将到期、逾期、完成状态清晰可辨

- [ ] **Step 3: Summarize the visual changes and any remaining polish ideas before handoff**

```text
确认只修改了视觉层，没有改变待办业务逻辑或通知机制。
```
