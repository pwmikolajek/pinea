import React, { useCallback, useState } from 'react';
import { ImageFile } from '../types';
import { TreePine } from 'lucide-react';
import addIcon from '../img/add.svg';

interface DropZoneProps {
  onImagesAdded: (images: ImageFile[]) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onImagesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set isDragging to false if we're leaving the dropzone
    // and not entering a child element
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [onImagesAdded]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        processFiles(files);
      }
    },
    [onImagesAdded]
  );

  const processFiles = useCallback(
    (files: File[]) => {
      const imageFiles = files.filter((file) => 
        file.type === 'image/jpeg' || 
        file.type === 'image/png'
      );

      if (imageFiles.length === 0) return;

      const newImages: ImageFile[] = imageFiles.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
      }));

      onImagesAdded(newImages);
    },
    [onImagesAdded]
  );

  return (
    <div
      className={`border-2 border-dotted ${isDragging ? 'border-green-500 bg-green-50' : 'border-[#CAC6B9]'} rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        multiple
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileInput}
      />
      <div className="flex justify-center mb-3">
        {isDragging ? (
          <TreePine className="mx-auto h-12 w-12 text-green-500" />
        ) : (
          <img src={addIcon} alt="Add images" className="mx-auto h-6 w-6" />
        )}
      </div>
      <p className={`mt-2 text-sm ${isDragging ? 'text-green-600 font-medium' : 'text-[#6C6A63]'}`}>
        {isDragging ? 'Drop images here' : 'Drag and drop images here, or click to select files'}
      </p>
      <p className="mt-1 text-xs text-[#6C6A63]">
        Supports JPEG and PNG files
      </p>
    </div>
  );
};

export default DropZone;