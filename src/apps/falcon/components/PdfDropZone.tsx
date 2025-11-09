import React, { useCallback, useState } from 'react';
import { FileText } from 'lucide-react';
import addIcon from '../../../core/assets/add.svg';

interface PdfDropZoneProps {
  onPdfSelected: (file: File) => void;
}

const PdfDropZone: React.FC<PdfDropZoneProps> = ({ onPdfSelected }) => {
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
    [onPdfSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        processFiles(files);
      }
    },
    [onPdfSelected]
  );

  const processFiles = useCallback(
    (files: File[]) => {
      const pdfFile = files.find((file) => file.type === 'application/pdf');

      if (pdfFile) {
        onPdfSelected(pdfFile);
      }
    },
    [onPdfSelected]
  );

  return (
    <div
      className={`border-2 border-dotted ${isDragging ? 'border-green-500 bg-green-50' : 'border-[#CAC6B9]'} rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => document.getElementById('pdf-file-input')?.click()}
    >
      <input
        id="pdf-file-input"
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileInput}
      />
      <div className="flex justify-center mb-3">
        {isDragging ? (
          <FileText className="mx-auto h-12 w-12 text-green-500" />
        ) : (
          <img src={addIcon} alt="Add PDF" className="mx-auto h-6 w-6" />
        )}
      </div>
      <p className={`mt-2 text-sm ${isDragging ? 'text-green-600 font-medium' : 'text-[#6C6A63]'}`}>
        {isDragging ? 'Drop PDF here' : 'Drag and drop a PDF here, or click to select file'}
      </p>
      <p className="mt-1 text-xs text-[#6C6A63]">
        Supports PDF files
      </p>
    </div>
  );
};

export default PdfDropZone;