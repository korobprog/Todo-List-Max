import React, { useMemo, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStatusStore } from '@/store/statusStore';
import { useTodoStore, type Todo } from '@/store/todoStore';
import { DraggableTodoItem } from './DraggableTodoItem';
import { TodoItem } from './TodoItem';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

interface TodoBoardProps {
  todos: Todo[];
}

// Droppable column component - must be defined outside of TodoBoard
const DroppableColumn = ({ statusId, children }: { statusId: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: statusId,
  });

  return (
    <div
      ref={setNodeRef}
      className={isOver ? 'ring-2 ring-primary rounded-lg' : ''}
    >
      {children}
    </div>
  );
};

const getStatusIcon = (statusName: string) => {
  const lowerName = statusName.toLowerCase();
  if (lowerName.includes('готово') || lowerName.includes('done') || lowerName.includes('выполнено')) {
    return <CheckCircle2 className="h-4 w-4" />;
  }
  if (lowerName.includes('работе') || lowerName.includes('progress') || lowerName.includes('процесс')) {
    return <Clock className="h-4 w-4" />;
  }
  return <Circle className="h-4 w-4" />;
};

export const TodoBoard = ({ todos }: TodoBoardProps) => {
  const statuses = useStatusStore((state) => state.statuses);
  const updateTodoStatus = useTodoStore((state) => state.updateTodoStatus);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Create sensors for drag and drop - simplified to avoid React 19 compatibility issues
  const sensors = useSensors(useSensor(PointerSensor));

  // Group todos by status
  const todosByStatus = useMemo(() => {
    const grouped: Record<string, Todo[]> = {};
    
    // Initialize with all statuses
    statuses.forEach((status) => {
      grouped[status.id] = [];
    });
    
    // Add column for tasks without status
    grouped['no-status'] = [];
    
    todos.forEach((todo) => {
      if (todo.statusId && grouped[todo.statusId]) {
        grouped[todo.statusId].push(todo);
      } else {
        grouped['no-status'].push(todo);
      }
    });
    
    return grouped;
  }, [todos, statuses]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const todoId = active.id as string;
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    // Get target status ID from droppable
    const targetStatusId = over.id as string;
    const isValidStatus = statuses.some(s => s.id === targetStatusId) || targetStatusId === 'no-status';
    
    if (!isValidStatus) return;

    const newStatusId = targetStatusId === 'no-status' ? null : targetStatusId;
    
    if (todo.statusId !== newStatusId) {
      try {
        await updateTodoStatus(todoId, newStatusId);
      } catch (error) {
        console.error('Error updating todo status:', error);
      }
    }
  };

  // Sort statuses by order
  const sortedStatuses = useMemo(() => {
    return [...statuses].sort((a, b) => a.order - b.order);
  }, [statuses]);

  const activeTodo = useMemo(() => {
    return activeId ? todos.find(t => t.id === activeId) : null;
  }, [activeId, todos]);

  if (statuses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет статусов. Статусы будут созданы автоматически.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
        {sortedStatuses.map((status) => {
          const statusTodos = todosByStatus[status.id] || [];
          
          return (
            <DroppableColumn key={status.id} statusId={status.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-shrink-0 w-80"
              >
                <Card className="bg-muted/30 border-2 h-full flex flex-col">
                  {/* Column Header */}
                  <div
                    className="p-4 border-b rounded-t-lg"
                    style={{
                      backgroundColor: `${status.color}15`,
                      borderColor: `${status.color}40`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      {getStatusIcon(status.name)}
                      <h3 className="font-semibold text-sm" style={{ color: status.color }}>
                        {status.name}
                      </h3>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {statusTodos.length} {statusTodos.length === 1 ? 'задача' : statusTodos.length < 5 ? 'задачи' : 'задач'}
                    </div>
                  </div>

                  {/* Column Content */}
                  <div
                    className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[400px]"
                    style={{ maxHeight: 'calc(100vh - 300px)' }}
                  >
                    <SortableContext
                      items={statusTodos.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {statusTodos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          Нет задач
                        </div>
                      ) : (
                        statusTodos.map((todo) => (
                          <DraggableTodoItem key={todo.id} todo={todo} />
                        ))
                      )}
                    </SortableContext>
                  </div>
                </Card>
              </motion.div>
            </DroppableColumn>
          );
        })}

        {/* Column for tasks without status - always show if there are tasks without status */}
        {(todosByStatus['no-status'] && todosByStatus['no-status'].length > 0) || todos.some(t => !t.statusId) ? (
          <DroppableColumn statusId="no-status">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 w-80"
            >
              <Card className="bg-muted/30 border-2 h-full flex flex-col">
                <div className="p-4 border-b rounded-t-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      Без статуса
                    </h3>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(todosByStatus['no-status']?.length || 0)} {(todosByStatus['no-status']?.length || 0) === 1 ? 'задача' : 'задач'}
                  </div>
                </div>
                <div
                  className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[400px]"
                  style={{ maxHeight: 'calc(100vh - 300px)' }}
                >
                  <SortableContext
                    items={(todosByStatus['no-status'] || []).map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {(todosByStatus['no-status'] && todosByStatus['no-status'].length > 0) ? (
                      todosByStatus['no-status'].map((todo) => (
                        <DraggableTodoItem key={todo.id} todo={todo} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Нет задач
                      </div>
                    )}
                  </SortableContext>
                </div>
              </Card>
            </motion.div>
          </DroppableColumn>
        ) : null}
      </div>

      <DragOverlay>
        {activeTodo ? (
          <div className="opacity-90 rotate-3 w-80">
            <TodoItem todo={activeTodo} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

