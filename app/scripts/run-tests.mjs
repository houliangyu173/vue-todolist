import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createTodo,
  getTodoStatus,
  markTodoNotified,
  shouldNotifyTodo,
} from '../src/lib/todos.js'
import {
  addTodoAndPersist,
  processDueTodos,
} from '../src/lib/todo-collection.js'
import {
  closeActiveReminder,
  queueReminder,
} from '../src/lib/reminders.js'

test('createTodo trims title and initializes pending reminder fields', () => {
  const todo = createTodo({
    title: '  交房租  ',
    dueAt: '2026-05-04T09:30',
    now: '2026-05-04T08:00:00.000Z',
  })

  assert.equal(todo.title, '交房租')
  assert.equal(todo.completed, false)
  assert.equal(todo.notified, false)
  assert.equal(todo.dueAt, '2026-05-04T09:30')
})

test('getTodoStatus returns overdue for unfinished past-due todos', () => {
  const status = getTodoStatus(
    {
      title: '提交日报',
      dueAt: '2026-05-04T09:00',
      completed: false,
    },
    '2026-05-04T10:00:00.000Z',
  )

  assert.equal(status, 'overdue')
})

test('shouldNotifyTodo only returns true once for an unfinished due todo', () => {
  const todo = createTodo({
    title: '开周会',
    dueAt: '2026-05-04T09:00',
    now: '2026-05-04T08:00:00.000Z',
  })

  assert.equal(shouldNotifyTodo(todo, '2026-05-04T09:00:00.000Z'), true)

  const notifiedTodo = markTodoNotified(todo)

  assert.equal(shouldNotifyTodo(notifiedTodo, '2026-05-04T09:01:00.000Z'), false)
})

test('addTodoAndPersist saves the first created todo immediately', () => {
  let persistedTodos = null

  const nextTodos = addTodoAndPersist(
    [],
    {
      title: '第一次事项',
      dueAt: '2026-05-05T10:00',
      now: '2026-05-05T09:00:00.000Z',
    },
    (todos) => {
      persistedTodos = todos
    },
  )

  assert.equal(nextTodos.length, 1)
  assert.equal(nextTodos[0].title, '第一次事项')
  assert.deepEqual(persistedTodos, nextTodos)
})

test('processDueTodos marks due todos notified and emits reminder titles', () => {
  const sentNotifications = []

  const result = processDueTodos(
    [
      createTodo({
        title: '开周会',
        dueAt: '2026-05-04T09:00',
        now: '2026-05-04T08:00:00.000Z',
      }),
    ],
    {
      now: '2026-05-04T09:00:00.000Z',
      notificationPermission: 'granted',
      notify: (todo) => {
        sentNotifications.push(todo.title)
      },
    },
  )

  assert.equal(result.hasChanges, true)
  assert.deepEqual(result.dueTitles, ['开周会'])
  assert.deepEqual(sentNotifications, ['开周会'])
  assert.equal(result.todos[0].notified, true)
})

test('queueReminder promotes the first due todo into the active reminder modal', () => {
  const state = queueReminder(
    {
      activeReminder: null,
      reminderQueue: [],
    },
    {
      id: 'todo-1',
      title: '提交周报',
      dueAt: '2026-05-05T17:30',
    },
  )

  assert.equal(state.activeReminder.title, '提交周报')
  assert.deepEqual(state.reminderQueue, [])
})

test('closeActiveReminder advances to the next queued reminder', () => {
  const state = closeActiveReminder({
    activeReminder: {
      id: 'todo-1',
      title: '提交周报',
      dueAt: '2026-05-05T17:30',
    },
    reminderQueue: [
      {
        id: 'todo-2',
        title: '给妈妈打电话',
        dueAt: '2026-05-05T18:00',
      },
    ],
  })

  assert.equal(state.activeReminder.title, '给妈妈打电话')
  assert.deepEqual(state.reminderQueue, [])
})
