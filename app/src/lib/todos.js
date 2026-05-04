const REMINDER_SOON_MS = 60 * 60 * 1000

function toTimestamp(value) {
  return new Date(value).getTime()
}

export function createTodo({ title, dueAt, now = new Date().toISOString() }) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title: title.trim(),
    dueAt,
    completed: false,
    notified: false,
    createdAt: new Date(now).toISOString(),
  }
}

export function getTodoStatus(todo, now = new Date().toISOString()) {
  if (todo.completed) {
    return 'completed'
  }

  const dueAt = toTimestamp(todo.dueAt)
  const current = toTimestamp(now)

  if (dueAt <= current) {
    return 'overdue'
  }

  if (dueAt - current <= REMINDER_SOON_MS) {
    return 'soon'
  }

  return 'upcoming'
}

export function shouldNotifyTodo(todo, now = new Date().toISOString()) {
  if (todo.completed || todo.notified) {
    return false
  }

  return toTimestamp(todo.dueAt) <= toTimestamp(now)
}

export function markTodoNotified(todo) {
  return {
    ...todo,
    notified: true,
  }
}

export function toggleTodoCompleted(todo) {
  return {
    ...todo,
    completed: !todo.completed,
  }
}

export function sortTodos(todos) {
  return [...todos].sort((left, right) => {
    if (left.completed !== right.completed) {
      return left.completed ? 1 : -1
    }

    return toTimestamp(left.dueAt) - toTimestamp(right.dueAt)
  })
}
