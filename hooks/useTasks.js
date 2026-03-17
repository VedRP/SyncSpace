/**
 * useTasks Hook
 * Convenience wrapper around the task store with filtered views.
 */
import useTaskStore from "@/store/taskStore";

export default function useTasks(projectId) {
  const store = useTaskStore();

  // Filter tasks for a specific project if projectId is provided
  const tasks = projectId
    ? store.tasks.filter((t) => t.projectId === projectId)
    : store.tasks;

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return {
    tasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    addTask: store.addTask,
    moveTask: store.moveTask,
    updateTask: store.updateTask,
    deleteTask: store.deleteTask,
    isLoading: store.isLoading,
  };
}
