import React from 'react';
import { Droppable, DroppableProps } from 'react-beautiful-dnd';

// This is a wrapper component for Droppable that handles the defaultProps
// to avoid the React warning about defaultProps on memo components
export const DroppableWrapper: React.FC<DroppableProps> = (props) => {
  // Set default props directly instead of using defaultProps
  const mergedProps = {
    type: 'DEFAULT',
    direction: 'vertical' as const,
    isDropDisabled: false,
    isCombineEnabled: false,
    ignoreContainerClipping: false,
    renderClone: null,
    ...props
  };
  
  return <Droppable {...mergedProps} />;
};

export default DroppableWrapper;