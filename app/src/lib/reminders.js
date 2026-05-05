function hasReminder(reminder, todoId) {
  return reminder?.id === todoId
}

export function queueReminder(state, todo) {
  const { activeReminder, reminderQueue } = state

  if (
    hasReminder(activeReminder, todo.id) ||
    reminderQueue.some((queuedReminder) => hasReminder(queuedReminder, todo.id))
  ) {
    return state
  }

  if (!activeReminder) {
    return {
      activeReminder: todo,
      reminderQueue,
    }
  }

  return {
    activeReminder,
    reminderQueue: [...reminderQueue, todo],
  }
}

export function closeActiveReminder(state) {
  const [nextReminder, ...restQueue] = state.reminderQueue

  return {
    activeReminder: nextReminder ?? null,
    reminderQueue: restQueue,
  }
}
