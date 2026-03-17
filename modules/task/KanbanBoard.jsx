/**
 * KanbanBoard — Drag-and-drop Kanban board using @dnd-kit.
 * 3 columns: To Do, In Progress, Done.
 */
"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useTaskStore from "@/store/taskStore";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import Button from "@/components/Button";

/* Column definitions */
const columns = [
  { id: "todo", title: "To Do", color: "cyan" },
  { id: "in-progress", title: "In Progress", color: "amber" },
  { id: "done", title: "Done", color: "emerald" },
];

const columnColors = {
  cyan: { dot: "bg-cyan-400", badge: "bg-cyan-500/15 text-cyan-400" },
  amber: { dot: "bg-amber-400", badge: "bg-amber-500/15 text-amber-400" },
  emerald: { dot: "bg-emerald-400", badge: "bg-emerald-500/15 text-emerald-400" },
};

/** Sortable task item wrapper */
function SortableTaskItem({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        onClick={() => onClick(task)}
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
      />
    </div>
  );
}

export default function KanbanBoard({ projectId }) {
  const { tasks, moveTask } = useTaskStore();
  const [showModal, setShowModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  // Filter tasks by project
  const projectTasks = projectId
    ? tasks.filter((t) => t.projectId === projectId)
    : tasks;

  // Configure drag sensors with distance threshold
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  /** Find which column a task ID belongs to */
  const findColumnForTask = (taskId) => {
    const task = projectTasks.find((t) => t.id === taskId);
    return task?.status;
  };

  /** Handle drag start */
  const handleDragStart = (event) => {
    const task = projectTasks.find((t) => t.id === event.active.id);
    setActiveTask(task);
  };

  /** Handle drag end — move task to new column */
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Check if dropped on a column ID directly
    const targetColumn = columns.find((c) => c.id === overId);
    if (targetColumn) {
      moveTask(activeId, targetColumn.id);
      return;
    }

    // Dropped on another task — find that task's column
    const overTaskColumn = findColumnForTask(overId);
    if (overTaskColumn) {
      moveTask(activeId, overTaskColumn);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Task Board</h1>
          <p className="text-sm text-gray-500 mt-1">Drag tasks between columns to update status</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </Button>
      </div>

      {/* Kanban columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map((col) => {
            const colTasks = projectTasks.filter((t) => t.status === col.id);
            const cc = columnColors[col.color];

            return (
              <div
                key={col.id}
                className="bg-[#0e0e16] rounded-2xl border border-gray-700/20 p-4"
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${cc.dot}`} />
                    <h3 className="text-sm font-semibold text-gray-300">{col.title}</h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${cc.badge}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Droppable area with sortable tasks */}
                <SortableContext
                  items={[col.id, ...colTasks.map((t) => t.id)]}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 kanban-column" id={col.id}>
                    {colTasks.map((task) => (
                      <SortableTaskItem
                        key={task.id}
                        task={task}
                        onClick={() => {}}
                      />
                    ))}

                    {/* Empty state */}
                    {colTasks.length === 0 && (
                      <div className="py-8 text-center border-2 border-dashed border-gray-700/30 rounded-xl">
                        <p className="text-xs text-gray-600">Drop tasks here</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        {/* Drag overlay — shows the card being dragged */}
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {/* Create task modal */}
      <TaskModal isOpen={showModal} onClose={() => setShowModal(false)} projectId={projectId} />
    </div>
  );
}
