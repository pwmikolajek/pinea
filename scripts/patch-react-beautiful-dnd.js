import fs from 'fs';
import path from 'path';

// Path to the react-beautiful-dnd ESM file
const filePath = path.resolve('./node_modules/react-beautiful-dnd/dist/react-beautiful-dnd.esm.js');

try {
  // Read the file
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file contains defaultProps for Droppable
    if (content.includes('Droppable.defaultProps = {')) {
      console.log('Patching react-beautiful-dnd to remove defaultProps...');
      
      // Replace the defaultProps section with a comment
      content = content.replace(
        /Droppable\.defaultProps = \{[\s\S]*?isCombineEnabled: false,[\s\S]*?renderClone: null[\s\S]*?\};/,
        '// Removed defaultProps to avoid React warnings'
      );
      
      // Write the modified content back to the file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Successfully patched react-beautiful-dnd!');
    } else {
      console.log('react-beautiful-dnd already patched or defaultProps not found.');
    }
  } else {
    console.log('react-beautiful-dnd ESM file not found. Skipping patch.');
  }
} catch (error) {
  console.error('Error patching react-beautiful-dnd:', error);
  // Don't fail the build if patching fails
  process.exit(0);
}