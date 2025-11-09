import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileDown, Loader2, Download, Settings } from 'lucide-react';
import logo from '../../../core/assets/logo.svg';
import PdfDropZone from '../components/PdfDropZone';
import ExtractedImagesList from '../components/ExtractedImagesList';
import { PdfPageImage } from '../types';
import { extractImagesFromPdf, calculateTotalImageSize } from '../utils/pdfExtractor';
import { formatEnvironmentalImpact, calculateEnvironmentalImpact } from '../../../core/utils/environmentalImpact';
import JSZip from 'jszip';

function PdfToJpeg() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedImages, setExtractedImages] = useState<PdfPageImage[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [environmentalImpact, setEnvironmentalImpact] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(0.8);
  const [scale, setScale] = useState<number>(1.5);
  const [showSettings, setShowSettings] = useState(false);

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

  const handlePdfSelected = useCallback((file: File) => {
    setPdfFile(file);
    setExtractedImages([]);
    setEnvironmentalImpact(null);
    setIsExtracting(true);

    extractImagesFromPdf(file, scale, quality)
      .then((images) => {
        setExtractedImages(images);
        
        // Calculate environmental impact
        const totalSize = calculateTotalImageSize(images);
        const impact = calculateEnvironmentalImpact(totalSize, images.length);
        setEnvironmentalImpact(formatEnvironmentalImpact(impact));
      })
      .catch((error) => {
        console.error('Error extracting images:', error);
        alert('Failed to extract images from PDF. Please try again with a different file.');
      })
      .finally(() => {
        setIsExtracting(false);
      });
  }, [scale, quality]);

  const handleDownloadImage = useCallback((image: PdfPageImage) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = pdfFile ? `${pdfFile.name.replace('.pdf', '')}_page_${image.pageNumber}.jpg` : `page_${image.pageNumber}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pdfFile]);

  const handleDownloadAll = useCallback(async () => {
    if (!pdfFile || extractedImages.length === 0) return;

    try {
      const zip = new JSZip();
      const fileName = pdfFile.name.replace('.pdf', '');
      
      // Add each image to the ZIP file
      extractedImages.forEach((image) => {
        // Convert data URL to blob
        const dataUrlParts = image.dataUrl.split(',');
        const byteString = atob(dataUrlParts[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([uint8Array], { type: 'image/jpeg' });
        
        // Add to ZIP with a formatted name
        const paddedPageNumber = image.pageNumber.toString().padStart(3, '0');
        zip.file(`${fileName}_page_${paddedPageNumber}.jpg`, blob);
      });
      
      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create a download link
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${fileName}_pages.zip`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      alert('Failed to download images. Please try again.');
    }
  }, [pdfFile, extractedImages]);

  const handleReprocess = useCallback(() => {
    if (!pdfFile) return;
    
    setExtractedImages([]);
    setEnvironmentalImpact(null);
    setIsExtracting(true);
    setShowSettings(false);

    extractImagesFromPdf(pdfFile, scale, quality)
      .then((images) => {
        setExtractedImages(images);
        
        // Calculate environmental impact
        const totalSize = calculateTotalImageSize(images);
        const impact = calculateEnvironmentalImpact(totalSize, images.length);
        setEnvironmentalImpact(formatEnvironmentalImpact(impact));
      })
      .catch((error) => {
        console.error('Error extracting images:', error);
        alert('Failed to extract images from PDF. Please try again with a different file.');
      })
      .finally(() => {
        setIsExtracting(false);
      });
  }, [pdfFile, scale, quality]);

  const handleClearAll = useCallback(() => {
    setPdfFile(null);
    setExtractedImages([]);
    setEnvironmentalImpact(null);
  }, []);

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center text-[#6C6A63] hover:text-[#3C3A33] transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Apps
          </Link>
          
          <h1 className="text-2xl font-medium text-[#6C6A63]">Falcon - PDF to JPEGs</h1>
          
          <div className="flex items-center">
            <img src={logo} alt="Pinea Logo" className="h-8" />
          </div>
        </div>

        <div className="rounded-[15px] border border-[rgba(108,106,99,0.10)] bg-[#F9F8F6] shadow-[0px_100px_80px_0px_rgba(108,106,99,0.02),0px_41.778px_33.422px_0px_rgba(108,106,99,0.01),0px_22.336px_17.869px_0px_rgba(108,106,99,0.01),0px_12.522px_10.017px_0px_rgba(108,106,99,0.01),0px_6.65px_5.32px_0px_rgba(108,106,99,0.01),0px_2.767px_2.214px_0px_rgba(108,106,99,0.01)] p-6">
          {!pdfFile ? (
            <PdfDropZone onPdfSelected={handlePdfSelected} />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-medium text-[#3C3A33]">
                    {pdfFile.name}
                  </h2>
                  <p className="text-sm text-[#6C6A63]">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowSettings(!showSettings)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-[#6C6A63] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-[#6C6A63] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              {showSettings && (
                <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-[#3C3A33] mb-3">
                    Extraction Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="quality" className="block text-sm text-[#6C6A63] mb-1">
                        JPEG Quality: {Math.round(quality * 100)}%
                      </label>
                      <input
                        type="range"
                        id="quality"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-[#6C6A63] mt-1">
                        <span>Lower (Smaller Files)</span>
                        <span>Higher (Better Quality)</span>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="scale" className="block text-sm text-[#6C6A63] mb-1">
                        Resolution Scale: {scale}x
                      </label>
                      <input
                        type="range"
                        id="scale"
                        min="0.5"
                        max="3"
                        step="0.5"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-[#6C6A63] mt-1">
                        <span>Smaller</span>
                        <span>Larger</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleReprocess}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Apply Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {isExtracting ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin h-10 w-10 text-green-500 mb-4" />
                  <p className="text-[#6C6A63]">Extracting images from PDF...</p>
                </div>
              ) : (
                <>
                  <ExtractedImagesList 
                    images={extractedImages} 
                    onDownloadImage={handleDownloadImage} 
                  />
                  
                  {extractedImages.length > 0 && (
                    <div className="mt-6 p-4 border border-green-200 rounded-md bg-green-50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-3 sm:mb-0">
                          <p className="text-sm text-green-700">
                            Successfully extracted {extractedImages.length} images!
                          </p>
                          {environmentalImpact && (
                            <p className="text-xs text-green-600 mt-1">
                              By working digitally, you will save {environmentalImpact} 🌲
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleDownloadAll}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <FileDown className="-ml-0.5 mr-2 h-4 w-4" />
                          Download All as ZIP
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
        
        <div className="mt-8 text-center text-sm text-[#6C6A63]">
          <p>
            Extract high-quality JPEG images from any PDF document.
            <br />
            Your PDF is processed entirely in your browser and is not uploaded to any server.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PdfToJpeg;