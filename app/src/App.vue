<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import {
  createTodo,
  getTodoStatus,
  markTodoNotified,
  shouldNotifyTodo,
  sortTodos,
  toggleTodoCompleted,
} from './lib/todos'

const STORAGE_KEY = 'vue-todo-reminders'
const CHECK_INTERVAL_MS = 30 * 1000

const form = ref({
  title: '',
  dueAt: '',
})

const todos = ref([])
const now = ref(Date.now())
const notificationPermission = ref('default')
const inlineMessage = ref('')

let timerId = null

function loadTodos() {
  const saved = window.localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return
  }

  try {
    todos.value = JSON.parse(saved)
  } catch (error) {
    console.error('Failed to parse saved todos.', error)
  }
}

function persistTodos() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.value))
}

function updatePermissionState() {
  if (!('Notification' in window)) {
    notificationPermission.value = 'unsupported'
    return
  }

  notificationPermission.value = Notification.permission
}

async function requestPermission() {
  if (!('Notification' in window)) {
    inlineMessage.value = '当前浏览器不支持桌面提醒，请使用页面内提示。'
    return
  }

  const permission = await Notification.requestPermission()
  notificationPermission.value = permission

  if (permission === 'granted') {
    inlineMessage.value = '提醒权限已开启，到点会自动弹出通知。'
    return
  }

  inlineMessage.value = '你还没有开启通知权限，系统会继续保留页面内提醒。'
}

function submitTodo() {
  if (!form.value.title.trim() || !form.value.dueAt) {
    inlineMessage.value = '请输入待办标题并选择截止时间。'
    return
  }

  todos.value = sortTodos([
    createTodo({
      title: form.value.title,
      dueAt: form.value.dueAt,
    }),
    ...todos.value,
  ])

  form.value = {
    title: '',
    dueAt: '',
  }

  inlineMessage.value = '待办已加入提醒列表。'
}

function handleToggle(todoId) {
  todos.value = sortTodos(
    todos.value.map((todo) =>
      todo.id === todoId ? toggleTodoCompleted(todo) : todo,
    ),
  )
}

function handleDelete(todoId) {
  todos.value = todos.value.filter((todo) => todo.id !== todoId)
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function notifyDueTodos() {
  const currentIso = new Date(now.value).toISOString()
  let hasChanges = false

  todos.value = todos.value.map((todo) => {
    if (!shouldNotifyTodo(todo, currentIso)) {
      return todo
    }

    hasChanges = true

    if (notificationPermission.value === 'granted') {
      new Notification('待办事项到点提醒', {
        body: `${todo.title} 已到截止时间`,
      })
    }

    inlineMessage.value = `提醒：${todo.title} 已到截止时间。`
    return markTodoNotified(todo)
  })

  if (hasChanges) {
    todos.value = sortTodos(todos.value)
  }
}

const sortedTodos = computed(() => sortTodos(todos.value))

const upcomingCount = computed(
  () =>
    sortedTodos.value.filter((todo) => getTodoStatus(todo, now.value) === 'soon')
      .length,
)

const overdueCount = computed(
  () =>
    sortedTodos.value.filter((todo) => getTodoStatus(todo, now.value) === 'overdue')
      .length,
)

watch(
  todos,
  () => {
    persistTodos()
  },
  { deep: true },
)

onMounted(() => {
  loadTodos()
  updatePermissionState()

  timerId = window.setInterval(() => {
    now.value = Date.now()
    notifyDueTodos()
  }, CHECK_INTERVAL_MS)

  notifyDueTodos()
})

onBeforeUnmount(() => {
  if (timerId) {
    window.clearInterval(timerId)
  }
})
</script>

<template>
  <main class="page-shell">
    <section class="hero-panel">
      <div class="hero-glow" aria-hidden="true"></div>
      <p class="eyebrow">Vue To-do Reminder</p>
      <div class="hero-title-wrap">
        <span class="hero-seal">卷一</span>
        <h1>待办清卷</h1>
        <p class="hero-subtitle">把待办放进一个会按时提醒你的清爽小工具里</p>
      </div>
      <p class="hero-copy">
        添加标题和截止时间，页面会自动保存，任务到点后会弹出浏览器提醒。
      </p>

      <div class="stats-grid">
        <article class="stat-card">
          <span class="stat-label">全部待办</span>
          <strong>{{ sortedTodos.length }}</strong>
        </article>
        <article class="stat-card">
          <span class="stat-label">即将到期</span>
          <strong>{{ upcomingCount }}</strong>
        </article>
        <article class="stat-card danger">
          <span class="stat-label">已经逾期</span>
          <strong>{{ overdueCount }}</strong>
        </article>
      </div>
    </section>

    <section class="workspace-grid">
      <div class="panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">通知设置</p>
            <h2>开启桌面提醒</h2>
          </div>
          <button class="secondary-button" type="button" @click="requestPermission">
            {{ notificationPermission === 'granted' ? '已授权' : '开启提醒' }}
          </button>
        </div>

        <p class="notification-copy">
          <template v-if="notificationPermission === 'granted'">
            浏览器通知权限已开启，待办到点时会自动弹窗提醒。
          </template>
          <template v-else-if="notificationPermission === 'unsupported'">
            当前浏览器不支持系统通知，仍会保留页面内提醒。
          </template>
          <template v-else>
            建议先开启通知权限，这样到点后即使你没盯着页面也能收到提醒。
          </template>
        </p>

        <p v-if="inlineMessage" class="inline-message">{{ inlineMessage }}</p>

        <form class="todo-form" @submit.prevent="submitTodo">
          <label>
            <span>待办标题</span>
            <input
              v-model="form.title"
              type="text"
              maxlength="60"
              placeholder="比如：提交周报、给妈妈打电话"
            />
          </label>

          <label>
            <span>截止时间</span>
            <input v-model="form.dueAt" type="datetime-local" />
          </label>

          <button class="primary-button" type="submit">添加待办</button>
        </form>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">任务列表</p>
            <h2>今天要记得的事</h2>
          </div>
        </div>

        <div v-if="sortedTodos.length === 0" class="empty-state">
          <h3>还没有待办</h3>
          <p>先添加一件最想被提醒的事，页面会自动帮你记住。</p>
        </div>

        <ul v-else class="todo-list">
          <li
            v-for="todo in sortedTodos"
            :key="todo.id"
            class="todo-card"
            :class="getTodoStatus(todo, now)"
          >
            <div class="todo-main">
              <label class="todo-check">
                <input
                  :checked="todo.completed"
                  type="checkbox"
                  @change="handleToggle(todo.id)"
                />
                <span>{{ todo.title }}</span>
              </label>
              <p class="todo-time">截止于 {{ formatDateTime(todo.dueAt) }}</p>
            </div>

            <div class="todo-side">
              <span class="status-badge">
                {{
                  getTodoStatus(todo, now) === 'completed'
                    ? '已完成'
                    : getTodoStatus(todo, now) === 'overdue'
                      ? '已逾期'
                      : getTodoStatus(todo, now) === 'soon'
                        ? '即将到期'
                        : '待处理'
                }}
              </span>
              <button class="text-button" type="button" @click="handleDelete(todo.id)">
                删除
              </button>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>
