<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import {
  getTodoStatus,
  sortTodos,
} from './lib/todos'
import {
  addTodoAndPersist,
  deleteTodoAndPersist,
  processDueTodos,
  toggleTodoAndPersist,
} from './lib/todo-collection'

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

const TODO_STATUS_LABELS = {
  completed: '已收笔',
  overdue: '过了时辰',
  soon: '快到钟点',
  upcoming: '还在案头',
}

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
    inlineMessage.value = '当前浏览器还不支持桌面提醒，不过案头页内提示会继续替你留意。'
    return
  }

  if (notificationPermission.value === 'denied') {
    inlineMessage.value = '系统提醒已被浏览器拦下，请到浏览器设置里手动重新打开；页内提醒会继续守着。'
    return
  }

  const permission = await Notification.requestPermission()
  notificationPermission.value = permission

  if (permission === 'granted') {
    inlineMessage.value = '案头提醒已经备妥，到了钟点会准时轻声招呼你。'
    return
  }

  inlineMessage.value =
    permission === 'denied'
      ? '系统提醒已被浏览器拦下，请到浏览器设置里手动重新打开；页内提醒会继续守着。'
      : '还没有打开系统提醒，页面里的案头提示仍会继续保留。'
}

function submitTodo() {
  if (!form.value.title.trim() || !form.value.dueAt) {
    inlineMessage.value = '请先写下札记内容，再选一个提醒时间。'
    return
  }

  todos.value = addTodoAndPersist(
    todos.value,
    {
      title: form.value.title,
      dueAt: form.value.dueAt,
    },
    persistTodos,
  )

  form.value = {
    title: '',
    dueAt: '',
  }

  inlineMessage.value = '这则札记已经收进案头，到了时间会提醒你。'
  now.value = Date.now()
  notifyDueTodos()
}

function handleToggle(todoId) {
  todos.value = toggleTodoAndPersist(todos.value, todoId, persistTodos)
}

function handleDelete(todoId) {
  todos.value = deleteTodoAndPersist(todos.value, todoId, persistTodos)
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
  const result = processDueTodos(todos.value, {
    now: new Date(now.value).toISOString(),
    notificationPermission: notificationPermission.value,
    notify: (todo) => {
      new Notification('案头提醒', {
        body: `${todo.title} 已到提醒时间`,
      })
    },
  })

  if (result.dueTitles.length === 1) {
    inlineMessage.value = `案头提醒：${result.dueTitles[0]} 已到提醒时间。`
  } else if (result.dueTitles.length > 1) {
    inlineMessage.value = `案头提醒：${result.dueTitles.join('、')} 都已到提醒时间。`
  }

  if (result.hasChanges) {
    todos.value = result.todos
    persistTodos()
  }
}

const sortedTodos = computed(() => sortTodos(todos.value))

const todoItems = computed(() =>
  sortedTodos.value.map((todo) => {
    const status = getTodoStatus(todo, now.value)

    return {
      ...todo,
      status,
      statusLabel: TODO_STATUS_LABELS[status],
    }
  }),
)

const upcomingCount = computed(
  () => todoItems.value.filter((todo) => todo.status === 'soon').length,
)

const overdueCount = computed(
  () => todoItems.value.filter((todo) => todo.status === 'overdue').length,
)

const notificationButtonLabel = computed(() => {
  if (notificationPermission.value === 'granted') {
    return '提醒已备妥'
  }

  if (notificationPermission.value === 'denied') {
    return '提醒已被拦下'
  }

  if (notificationPermission.value === 'unsupported') {
    return '当前浏览器不支持'
  }

  return '轻声开启'
})

const inlineMessageAriaLive = computed(() =>
  inlineMessage.value.includes('请先') ? 'assertive' : 'polite',
)

onMounted(() => {
  loadTodos()
  todos.value = sortTodos(todos.value)
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
      <div class="hero-paper">
        <p class="eyebrow">案头小札</p>
        <div class="hero-title-wrap">
          <span class="hero-seal">今日</span>
          <h1>今日札记</h1>
          <p class="hero-subtitle">把今天惦记的事轻轻记下，书桌会替你按时提醒</p>
        </div>
        <p class="hero-copy">
          写下事项和时间，页面会自动收存；到了钟点，案头提醒会准时出现。
        </p>
      </div>

      <div class="stats-grid">
        <article class="stat-card">
          <span class="stat-label">案头札记</span>
          <strong>{{ sortedTodos.length }}</strong>
        </article>
        <article class="stat-card">
          <span class="stat-label">临近钟点</span>
          <strong>{{ upcomingCount }}</strong>
        </article>
        <article class="stat-card danger">
          <span class="stat-label">过了时辰</span>
          <strong>{{ overdueCount }}</strong>
        </article>
      </div>
    </section>

    <section class="workspace-grid">
      <div class="panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">提醒小笺</p>
            <h2>让案头替你出声</h2>
          </div>
          <button class="secondary-button" type="button" @click="requestPermission">
            {{ notificationButtonLabel }}
          </button>
        </div>

        <p class="notification-copy">
          <template v-if="notificationPermission === 'granted'">
            浏览器通知已经备妥，札记一到钟点，案头就会及时提醒你。
          </template>
          <template v-else-if="notificationPermission === 'denied'">
            浏览器已拦下系统提醒；下方只显示当前状态说明，若要恢复案头出声，请到浏览器设置里手动打开通知权限。
          </template>
          <template v-else-if="notificationPermission === 'unsupported'">
            当前浏览器不支持系统通知；下方按钮仅作状态提示，不过页内提醒仍会照常守着。
          </template>
          <template v-else>
            如果先把提醒打开，就算你暂时离开页面，到了时间也不会轻易错过。
          </template>
        </p>

        <p
          v-if="inlineMessage"
          class="inline-message"
          role="status"
          :aria-live="inlineMessageAriaLive"
          aria-atomic="true"
        >
          {{ inlineMessage }}
        </p>

        <form class="todo-form" @submit.prevent="submitTodo">
          <label>
            <span>札记内容</span>
            <input
              v-model="form.title"
              type="text"
              maxlength="60"
              placeholder="比如：整理读书摘记、给家里回个电话"
            />
          </label>

          <label>
            <span>提醒时间</span>
            <input v-model="form.dueAt" type="datetime-local" />
          </label>

          <button class="primary-button" type="submit">落下一笔</button>
        </form>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">今日页签</p>
            <h2>桌上待理的几件事</h2>
          </div>
        </div>

        <div v-if="sortedTodos.length === 0" class="empty-state">
          <h3>这一页还空着</h3>
          <p>先记下一件最不想忘记的事，案头会替你稳稳收着。</p>
        </div>

        <ul v-else class="todo-list">
          <li v-for="todo in todoItems" :key="todo.id" class="todo-card" :class="todo.status">
            <div class="todo-main">
              <label class="todo-check">
                <input
                  :checked="todo.completed"
                  type="checkbox"
                  @change="handleToggle(todo.id)"
                />
                <span>{{ todo.title }}</span>
              </label>
              <p class="todo-time">记在 {{ formatDateTime(todo.dueAt) }}</p>
            </div>

            <div class="todo-side">
              <span class="status-badge">{{ todo.statusLabel }}</span>
              <button class="text-button" type="button" @click="handleDelete(todo.id)">
                划去
              </button>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>
