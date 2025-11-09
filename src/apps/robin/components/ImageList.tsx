import React from 'react';
import { ImageFile } from '../types';
import { Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageListProps {
  images: ImageFile[];
  onReorder: (images: ImageFile[]) => void;
  onRemove: (id: string) => void;
}

interface SortableImageItemProps {
  image: ImageFile;
  onRemove: (id: string) => void;
}

const SortableImageItem: React.FC<SortableImageItemProps> = ({ image, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-2 bg-white rounded-lg shadow-sm border ${
        isDragging ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'
      }`}
      {...attributes}
    >
      <div 
        {...listeners} 
        className="mr-2 text-[#6C6A63] cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={20} />
      </div>
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={image.preview}
          alt={`Preview`}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="ml-4 flex-1 truncate">
        <p className="text-sm font-medium text-[#6C6A63] truncate">
          {image.file.name}
        </p>
        <p className="text-xs text-[#6C6A63]/80">
          {(image.file.size / 1024).toFixed(1)} KB
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(image.id)}
        className="ml-2 text-[#6C6A63]/70 hover:text-red-500"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

const ImageList: React.FC<ImageListProps> = ({ images, onReorder, onRemove }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(item => item.id === active.id);
      const newIndex = images.findIndex(item => item.id === over.id);
      
      onReorder(arrayMove(images, oldIndex, newIndex));
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={images.map(image => image.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mt-6 space-y-2">
          {images.map((image) => (
            <SortableImageItem
              key={image.id}
              image={image}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ImageList;