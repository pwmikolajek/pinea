import * as pdfjsLib from 'pdfjs-dist';
import { PdfPageImage } from '../types';
import JSZip from 'jszip';

// Initialize PDF.js worker with the matching version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/**
 * Extract JPEG images from a PDF file
 * @param file PDF file to extract images from
 * @param scale Scale factor for rendering (1.5 = 150% of original size)
 * @param quality JPEG quality (0-1)
 * @returns Promise resolving to an array of PdfPageImage objects
 */
export const extractImagesFromPdf = async (
  file: File,
  scale: number = 1.5,
  quality: number = 0.8
): Promise<PdfPageImage[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Read the PDF file as an ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const totalPages = pdf.numPages;
      const extractedImages: PdfPageImage[] = [];
      
      // Process each page
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        // Get the page
        const page = await pdf.getPage(pageNumber);
        
        // Get the viewport at the desired scale
        const viewport = page.getViewport({ scale });
        
        // Create a canvas to render the page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Could not create canvas context');
        }
        
        // Set canvas dimensions to match the viewport
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Render the page to the canvas
        await page.render({
          canvasContext: context,
          viewport,
        }).promise;
        
        // Convert the canvas to a data URL (JPEG)
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Add the extracted image to the array
        extractedImages.push({
          id: `page-${pageNumber}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          pageNumber,
          dataUrl,
          width: viewport.width,
          height: viewport.height,
        });
      }
      
      resolve(extractedImages);
    } catch (error) {
      console.error('Error extracting images from PDF:', error);
      reject(error);
    }
  });
};

/**
 * Calculate the total size of extracted images in bytes (approximate)
 * @param images Array of PdfPageImage objects
 * @returns Total size in bytes
 */
export const calculateTotalImageSize = (images: PdfPageImage[]): number => {
  return images.reduce((total, image) => {
    // Estimate size based on data URL length (removing the header)
    const base64 = image.dataUrl.split(',')[1];
    const sizeInBytes = (base64.length * 3) / 4; // Base64 to binary conversion ratio
    return total + sizeInBytes;
  }, 0);
};

/**
 * Download all extracted images as a ZIP file
 * @param images Array of PdfPageImage objects
 * @param fileName Name of the PDF file (without extension)
 */
export const downloadImagesAsZip = async (
  images: PdfPageImage[],
  fileName: string
): Promise<void> => {
  try {
    const zip = new JSZip();
    
    // Add each image to the ZIP file
    images.forEach((image) => {
      // Convert data URL to blob
      const dataUrlParts = image.dataUrl.split(',');
      const mimeType = dataUrlParts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const byteString = atob(dataUrlParts[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([arrayBuffer], { type: mimeType });
      
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
    throw error;
  }
};