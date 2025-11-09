import jsPDF from 'jspdf';
import { ImageFile } from '../types';

export const generatePDF = async (images: ImageFile[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (images.length === 0) {
      reject(new Error('No images to generate PDF'));
      return;
    }

    try {
      // Create a new PDF document with custom dimensions
      // We'll set the dimensions for each page based on the image
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [1, 1], // Temporary size, will be adjusted for each image
        hotfixes: ['px_scaling']
      });

      let currentPage = 0;

      const processImage = (index: number) => {
        if (index >= images.length) {
          // All images processed, return the PDF as data URL
          const pdfOutput = pdf.output('datauristring');
          resolve(pdfOutput);
          return;
        }

        const image = images[index];
        
        // If not the first page, add a new page
        if (index > 0) {
          pdf.addPage();
        }

        // Create an image element to get dimensions
        const img = new Image();
        img.src = image.preview;
        
        img.onload = () => {
          // Set the PDF page size to match the image dimensions exactly
          if (index > 0) {
            pdf.setPage(index + 1);
          }
          
          // Set the page size to match the image dimensions exactly
          pdf.internal.pageSize.width = img.width;
          pdf.internal.pageSize.height = img.height;
          
          // Add the image to the PDF at full size with no margins
          pdf.addImage(
            image.preview,
            image.file.type === 'image/png' ? 'PNG' : 'JPEG',
            0,
            0,
            img.width,
            img.height
          );
          
          // Process the next image
          processImage(index + 1);
        };
        
        img.onerror = () => {
          reject(new Error(`Failed to load image: ${image.file.name}`));
        };
      };

      // Start processing the first image
      processImage(0);
    } catch (error) {
      reject(error);
    }
  });
};