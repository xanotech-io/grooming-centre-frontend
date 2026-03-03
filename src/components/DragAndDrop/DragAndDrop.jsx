import { Box } from "@chakra-ui/layout";
import {
  DragDropContext,
  Droppable as Dropzone,
  Draggable,
} from "react-beautiful-dnd";

export const DroppableList = ({ onDragEnd, children, ...rest }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Dropzone droppableId="superHeroes">
        {(provided) => (
          <Box
            {...rest}
            //
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {children}
            {provided.placeholder}
          </Box>
        )}
      </Dropzone>
    </DragDropContext>
  );
};

export const DraggableItem = ({
  children,
  draggableIndex,
  draggableId,
  ...rest
}) => (
  <Draggable index={draggableIndex} draggableId={draggableId}>
    {(provided) => (
      <Box
        {...rest}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        {children}
      </Box>
    )}
  </Draggable>
);
