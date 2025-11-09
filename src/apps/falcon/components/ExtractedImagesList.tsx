import React from 'react';
import { PdfPageImage } from '../types';
import { Download } from 'lucide-react';

interface ExtractedImagesListProps {
  images: PdfPageImage[];
  onDownloadImage: (image: PdfPageImage) => void;
}

const ExtractedImagesList: React.FC<ExtractedImagesListProps> = ({ 
  images, 
  onDownloadImage 
}) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-[#6C6A63] mb-3">
        Extracted Pages ({images.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => {
          // Calculate aspect ratio to maintain proper dimensions
          const aspectRatio = (image.height / image.width) * 100;
          
          return (
            <div 
              key={image.id} 
              className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group"
            >
              <div 
                className="relative w-full overflow-hidden"
                style={{ paddingBottom: `${aspectRatio}%` }}
              >
                <img
                  src={image.dataUrl}
                  alt={`Page ${image.pageNumber}`}
                  className="absolute top-0 left-0 w-full h-full object-contain"
                />
              </div>
              <div className="p-2 flex items-center justify-between bg-gray-50 border-t border-gray-200">
                <span className="text-sm text-[#6C6A63]">
                  Page {image.pageNumber}
                </span>
                <button
                  type="button"
                  onClick={() => onDownloadImage(image)}
                  className="text-[#6C6A63] hover:text-green-600 transition-colors"
                  title="Download this image"
                >
                  <Download size={18} />
                </button>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExtractedImagesList;