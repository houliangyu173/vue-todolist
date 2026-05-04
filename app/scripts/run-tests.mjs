import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createTodo,
  getTodoStatus,
  markTodoNotified,
  shouldNotifyTodo,
} from '../src/lib/todos.js'

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
