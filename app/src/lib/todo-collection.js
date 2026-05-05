import {
  createTodo,
  markTodoNotified,
  shouldNotifyTodo,
  sortTodos,
  toggleTodoCompleted,
} from './todos.js'

export function addTodoAndPersist(todos, todoInput, persist = () => {}) {
  const nextTodos = sortTodos([
    createTodo(todoInput),
    ...todos,
  ])

  persist(nextTodos)
  return nextTodos
}

export function toggleTodoAndPersist(todos, todoId, persist = () => {}) {
  const nextTodos = sortTodos(
    todos.map((todo) => (todo.id === todoId ? toggleTodoCompleted(todo) : todo)),
  )

  persist(nextTodos)
  return nextTodos
}

export function deleteTodoAndPersist(todos, todoId, persist = () => {}) {
  const nextTodos = todos.filter((todo) => todo.id !== todoId)

  persist(nextTodos)
  return nextTodos
}

export function processDueTodos(
  todos,
  { now = new Date().toISOString(), notificationPermission = 'default', notify = () => {} } = {},
) {
  let hasChanges = false
  const dueTitles = []

  const nextTodos = todos.map((todo) => {
    if (!shouldNotifyTodo(todo, now)) {
      return todo
    }

    hasChanges = true

    if (notificationPermission === 'granted') {
      notify(todo)
    }

    dueTitles.push(todo.title)
    return markTodoNotified(todo)
  })

  return {
    hasChanges,
    dueTitles,
    todos: hasChanges ? sortTodos(nextTodos) : nextTodos,
  }
}
