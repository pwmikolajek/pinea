import React, { useState, useCallback, useEffect } from 'react';
import { ImageFile } from './types';
import DropZone from './components/DropZone';
import ImageList from './components/ImageList';
import { generatePDF } from './utils/pdfGenerator';
import { FileDown, Loader2, FilePlus2 } from 'lucide-react';
import logo from './img/logo.svg';
import { calculateEnvironmentalImpact, formatEnvironmentalImpact } from './utils/environmentalImpact';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [environmentalImpact, setEnvironmentalImpact] = useState<string | null>(null);

  // Setup global drag and drop handling
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
    };

    // Prevent browser from opening files when dropped outside dropzone
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

  const handleImagesAdded = useCallback((newImages: ImageFile[]) => {
    setImages((prevImages) => [...prevImages, ...newImages]);
    // Clear any previously generated PDF
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
      setEnvironmentalImpact(null);
    }
  }, [pdfUrl]);

  const handleReorder = useCallback((reorderedImages: ImageFile[]) => {
    setImages(reorderedImages);
    // Clear any previously generated PDF
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
      setEnvironmentalImpact(null);
    }
  }, [pdfUrl]);

  const handleRemove = useCallback((id: string) => {
    setImages((prevImages) => {
      const updatedImages = prevImages.filter((image) => image.id !== id);
      return updatedImages;
    });
    // Clear any previously generated PDF
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
      setEnvironmentalImpact(null);
    }
  }, [pdfUrl]);

  const handleGeneratePDF = useCallback(async () => {
    if (images.length === 0) return;

    setIsGenerating(true);
    try {
      const pdfDataUri = await generatePDF(images);
      setPdfUrl(pdfDataUri);
      
      // Calculate total file size of all images
      const totalFileSize = images.reduce((sum, img) => sum + img.file.size, 0);
      
      // Calculate environmental impact
      const impact = calculateEnvironmentalImpact(totalFileSize, images.length);
      setEnvironmentalImpact(formatEnvironmentalImpact(impact));
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [images]);

  const handleClearAll = useCallback(() => {
    // Revoke all object URLs to prevent memory leaks
    images.forEach((image) => URL.revokeObjectURL(image.preview));
    
    // Clear the images array
    setImages([]);
    
    // Clear any previously generated PDF
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
      setEnvironmentalImpact(null);
    }
  }, [images, pdfUrl]);

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <img src={logo} alt="Pine Logo" className="h-10" />
          </div>
          <p className="mt-2 text-[#6C6A63]">
            Simple image to PDF conversion, naturally
          </p>
        </div>

        <div className="rounded-[15px] border border-[rgba(108,106,99,0.10)] bg-[#F9F8F6] shadow-[0px_100px_80px_0px_rgba(108,106,99,0.02),0px_41.778px_33.422px_0px_rgba(108,106,99,0.01),0px_22.336px_17.869px_0px_rgba(108,106,99,0.01),0px_12.522px_10.017px_0px_rgba(108,106,99,0.01),0px_6.65px_5.32px_0px_rgba(108,106,99,0.01),0px_2.767px_2.214px_0px_rgba(108,106,99,0.01)] p-6">
          <DropZone onImagesAdded={handleImagesAdded} />
          
          <ImageList 
            images={images} 
            onReorder={handleReorder} 
            onRemove={handleRemove} 
          />
          
          {images.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-[#6C6A63] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Clear All
              </button>
              
              <button
                type="button"
                onClick={handleGeneratePDF}
                disabled={isGenerating || images.length === 0}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  (isGenerating || images.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FilePlus2 className="-ml-1 mr-2 h-4 w-4" />
                    Generate PDF
                  </>
                )}
              </button>
            </div>
          )}
          
          {pdfUrl && (
            <div className="mt-6 p-4 border border-green-200 rounded-md bg-green-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-3 sm:mb-0">
                  <p className="text-sm text-green-700">
                    PDF generated successfully!
                  </p>
                  {environmentalImpact && (
                    <p className="text-xs text-green-600 mt-1">
                      By not printing this PDF, you will save {environmentalImpact} 🌲
                    </p>
                  )}
                </div>
                <a
                  href={pdfUrl}
                  download="pine-document.pdf"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FileDown className="-ml-0.5 mr-2 h-4 w-4" />
                  Download PDF
                </a>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-sm text-[#6C6A63]">
          <p>
            Drag and drop multiple images to rearrange their order in the PDF.
            <br />
            Your images are processed entirely in your browser and are not uploaded to any server.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;