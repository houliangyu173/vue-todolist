# Vue Todo Study Aesthetic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前待办提醒页面整体改造成“留白书页”路线的书房案头风，同时保持新增、提醒、完成、删除和本地存储逻辑不变。

**Architecture:** 以 `app/src/App.vue` 承担文案语气与少量展示结构调整，以 `app/src/style.css` 负责完整视觉系统重写。实现时不触碰 `app/src/lib/` 下的待办与提醒逻辑，只重塑展示层、状态表达和弹窗外观，并用构建命令验证 Vue 模板与样式改动没有引入回归。

**Tech Stack:** Vue 3, Vite, JavaScript, CSS

---

## File Structure

- Modify: `app/src/App.vue`
  - 调整页面标题、分区名称、按钮文案、空状态与提醒弹窗文案
  - 根据纸页风格补充极少量展示容器，例如题签或分隔装饰用的包裹节点
- Modify: `app/src/style.css`
  - 重写全局暖纸色背景、Hero、统计卡、表单、按钮、任务卡、badge、弹窗与响应式样式
- Verify: `app/package.json`
  - 使用现有 `build` 与 `test` 脚本，不新增依赖、不新增测试框架配置

### Task 1: Refresh Page Copy And Markup Hooks

**Files:**
- Modify: `app/src/App.vue`
- Test: `app/src/App.vue`

- [ ] **Step 1: Update the hero and modal copy to the approved study-aesthetic tone**

```vue
<p class="section-kicker">到时提醒</p>
<h2 id="reminder-title">案头提醒</h2>
<p class="reminder-copy">这一则小记已经到了约定时刻，别让它从手边悄悄滑过去。</p>

<p class="eyebrow">Study Ledger</p>
<div class="hero-title-wrap">
  <span class="hero-seal">卷一</span>
  <h1>今日札记</h1>
  <p class="hero-subtitle">把记挂的事轻轻写下，等它到了时辰，再来案头提醒你。</p>
</div>
```

- [ ] **Step 2: Rename section headings, placeholders, and actions so the whole page reads like a desk journal instead of a generic tool**

```vue
<h2>整一整提醒</h2>
<button class="secondary-button" type="button" @click="requestPermission">
  {{ notificationPermission === 'granted' ? '已开卷' : '启用提醒' }}
</button>

<span>记下此事</span>
<input
  v-model="form.title"
  type="text"
  maxlength="60"
  placeholder="比如：誊清周报、回一封家书"
/>

<button class="primary-button" type="submit">添一则</button>
```

- [ ] **Step 3: Add only minimal presentational hooks needed by the new paper layout without changing bindings or event handlers**

```vue
<section class="hero-panel">
  <div class="hero-paper-edge" aria-hidden="true"></div>
  <div class="hero-stamp-shadow" aria-hidden="true"></div>
  ...
</section>
```

- [ ] **Step 4: Run the build to verify the template still compiles after copy and markup updates**

Run: `npm run build`
Expected: Vite build completes successfully with no Vue template errors

### Task 2: Rebuild The Global Paper Theme

**Files:**
- Modify: `app/src/style.css`
- Test: `app/src/style.css`

- [ ] **Step 1: Replace the current dark root theme with a warm paper palette and serif-forward font stack**

```css
:root {
  font-family: "Iowan Old Style", "Songti SC", "STSong", "SimSun", serif;
  line-height: 1.6;
  font-weight: 400;
  color: #4c3425;
  background:
    radial-gradient(circle at top, rgba(151, 76, 33, 0.06), transparent 30%),
    linear-gradient(180deg, #f4ecdf 0%, #efe4d2 46%, #e6d7bf 100%);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}
```

- [ ] **Step 2: Rework the page shell and shared surfaces into layered paper panels with restrained borders and warm shadows**

```css
body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  color: #4c3425;
  background:
    radial-gradient(circle at top, rgba(151, 76, 33, 0.06), transparent 30%),
    linear-gradient(180deg, #f4ecdf 0%, #efe4d2 46%, #e6d7bf 100%);
}

.hero-panel,
.panel,
.reminder-modal {
  background: linear-gradient(180deg, rgba(252, 247, 238, 0.98), rgba(243, 233, 215, 0.96));
  border: 1px solid rgba(123, 92, 63, 0.18);
  border-radius: 24px;
  box-shadow:
    0 18px 36px rgba(92, 67, 45, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}
```

- [ ] **Step 3: Add subtle paper grain and wood-desk atmosphere without introducing image assets**

```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(
      0deg,
      rgba(138, 103, 68, 0.03) 0,
      rgba(138, 103, 68, 0.03) 1px,
      transparent 1px,
      transparent 22px
    );
  opacity: 0.7;
}
```

- [ ] **Step 4: Run the build to confirm the CSS foundation compiles cleanly**

Run: `npm run build`
Expected: Build succeeds and the page no longer uses the old dark-theme palette

### Task 3: Restyle Hero And Summary Cards As A Title Page

**Files:**
- Modify: `app/src/style.css`
- Modify: `app/src/App.vue`
- Test: `app/src/App.vue`

- [ ] **Step 1: Turn the hero into a title-page composition with seal, paper edge, and editorial spacing**

```css
.hero-panel {
  position: relative;
  overflow: hidden;
  padding: 40px 40px 34px;
}

.hero-seal {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #a02d24, #81211a);
  color: #fff1e7;
  box-shadow: 0 12px 22px rgba(160, 45, 36, 0.18);
}

.hero-panel h1 {
  font-size: clamp(2.6rem, 5vw, 4.4rem);
  line-height: 1.04;
  letter-spacing: 0.18em;
  color: #3d281b;
}
```

- [ ] **Step 2: Restyle eyebrow, subtitle, copy, and stat cards to fit the quiet paper hierarchy**

```css
.eyebrow,
.section-kicker {
  color: #8a5c37;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.stat-card {
  padding: 18px 20px;
  border-radius: 18px;
  background: rgba(255, 250, 242, 0.84);
  border: 1px solid rgba(132, 99, 68, 0.14);
}

.stat-card strong {
  color: #482d20;
}
```

- [ ] **Step 3: Ensure the danger summary card uses restrained vermilion instead of the previous neon warning tone**

```css
.stat-card.danger {
  background: rgba(163, 56, 45, 0.08);
  border-color: rgba(163, 56, 45, 0.18);
}

.stat-card.danger strong {
  color: #9d342b;
}
```

- [ ] **Step 4: Run the build to verify hero-specific hook changes did not break the template**

Run: `npm run build`
Expected: Build succeeds and the hero reads like a warm title page rather than a dark dashboard

### Task 4: Rework Forms, Buttons, And Inline Callouts

**Files:**
- Modify: `app/src/style.css`
- Modify: `app/src/App.vue`
- Test: `app/src/App.vue`

- [ ] **Step 1: Redesign inputs and labels to look like journal entry fields with strong readability on a light paper background**

```css
.todo-form span {
  font-weight: 600;
  color: #5b3d2b;
}

.todo-form input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(131, 98, 68, 0.2);
  border-radius: 14px;
  background: rgba(255, 252, 246, 0.92);
  color: #422d20;
}

.todo-form input:focus {
  outline: 2px solid rgba(160, 45, 36, 0.28);
  border-color: rgba(160, 45, 36, 0.42);
}
```

- [ ] **Step 2: Restyle action buttons into a seal-inspired primary action and a lighter note-style secondary action**

```css
.primary-button {
  border: 0;
  background: linear-gradient(135deg, #a02d24, #832219);
  color: #fff4eb;
  box-shadow: 0 14px 24px rgba(160, 45, 36, 0.16);
}

.secondary-button {
  border: 1px solid rgba(131, 98, 68, 0.22);
  background: rgba(255, 250, 242, 0.78);
  color: #6b4a35;
}
```

- [ ] **Step 3: Reframe inline message, notification text, and empty state as soft notes instead of app alerts**

```css
.inline-message {
  border: 1px solid rgba(160, 45, 36, 0.16);
  background: rgba(160, 45, 36, 0.06);
  color: #7d2c26;
}

.empty-state {
  border: 1px dashed rgba(132, 99, 68, 0.26);
  background: rgba(255, 249, 240, 0.76);
}
```

- [ ] **Step 4: Run the build to verify the form and action area remains intact**

Run: `npm run build`
Expected: Build succeeds and the form area remains visually readable and fully interactive

### Task 5: Restyle Todo Cards, Status Badges, And Reminder Modal

**Files:**
- Modify: `app/src/style.css`
- Modify: `app/src/App.vue`
- Test: `app/src/App.vue`

- [ ] **Step 1: Convert todo cards into layered note slips with gentler borders and warmer text**

```css
.todo-card {
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 250, 242, 0.96), rgba(246, 238, 223, 0.98));
  border: 1px solid rgba(131, 98, 68, 0.14);
}

.todo-check {
  color: #432d21;
}

.todo-time {
  color: #86664a;
}
```

- [ ] **Step 2: Map soon, overdue, and completed states to the paper-based status system**

```css
.todo-card.soon {
  border-color: rgba(176, 111, 62, 0.32);
  background: linear-gradient(180deg, rgba(252, 244, 229, 0.98), rgba(246, 234, 211, 0.96));
}

.todo-card.overdue {
  border-color: rgba(160, 45, 36, 0.24);
  background: linear-gradient(180deg, rgba(252, 239, 234, 0.98), rgba(246, 225, 218, 0.96));
}

.todo-card.completed {
  opacity: 0.62;
}
```

- [ ] **Step 3: Restyle badges, delete action, overlay, and reminder modal to match the same desk-note system**

```css
.status-badge {
  background: rgba(160, 45, 36, 0.08);
  border: 1px solid rgba(160, 45, 36, 0.12);
  color: #8b3028;
}

.reminder-overlay {
  background: rgba(92, 67, 45, 0.28);
  backdrop-filter: blur(6px);
}

.text-button {
  color: #9a352d;
}
```

- [ ] **Step 4: Run the build to verify status and modal updates compile**

Run: `npm run build`
Expected: Build succeeds and the reminder modal now matches the paper aesthetic

### Task 6: Final Verification And Cleanup

**Files:**
- Modify: `app/src/style.css`
- Modify: `app/src/App.vue`
- Test: `app/package.json`

- [ ] **Step 1: Review mobile breakpoints and reduce decorative density where paper details crowd the layout**

```css
@media (max-width: 900px) {
  .workspace-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .hero-panel,
  .panel {
    padding: 24px;
  }
}
```

- [ ] **Step 2: Run the project test script to verify styling changes did not break existing reminder behavior**

Run: `npm test`
Expected: Existing node-based tests pass

- [ ] **Step 3: Run the production build one final time to catch any template or CSS regressions**

Run: `npm run build`
Expected: Build completes successfully

- [ ] **Step 4: Review the final page in the browser and confirm the approved acceptance points**

Run: `npm run dev`
Expected: 页面呈现统一的留白书页风格；文案有书卷气但清晰；表单、列表、弹窗与移动端都保持可用
