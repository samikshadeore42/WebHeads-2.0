import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Activity {
  id: string;
  name: string;
}

interface ActivityListProps {
  activities: Activity[];
  updateActivityOrder: (newOrder: Activity[]) => void;
}

export default function ActivityList({ activities, updateActivityOrder }: ActivityListProps) {
  const handleDragEnd = (result: any) => {
    const { source, destination } = result;

    // If the item was dropped outside the list, do nothing
    if (!destination) return;

    // If the item is dropped back in the same position, do nothing
    if (source.index === destination.index) return;

    // Reorder the activities array
    const reorderedActivities = Array.from(activities);
    const [movedActivity] = reorderedActivities.splice(source.index, 1);
    reorderedActivities.splice(destination.index, 0, movedActivity);

    // Pass the reordered activities to the parent for saving
    updateActivityOrder(reorderedActivities);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="activities">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {activities.map((activity, index) => (
              <Draggable key={activity.id} draggableId={activity.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="p-4 bg-white rounded shadow mb-2"
                  >
                    <p>{activity.name}</p>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
