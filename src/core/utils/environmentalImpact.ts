/**
 * Environmental impact calculation utilities
 * 
 * These calculations are estimates based on industry averages and research.
 * Sources:
 * - Average paper consumption: 10,000 sheets = 1 tree
 * - Average A4 sheet weight: 5g
 * - CO2 emissions: ~3.5kg CO2 per kg of paper
 */

/**
 * Calculate the number of trees saved by not printing a PDF
 * @param fileSize Total size of images in bytes
 * @param pageCount Number of pages in the PDF
 * @returns Object containing trees saved and CO2 emissions avoided
 */
export const calculateEnvironmentalImpact = (
  fileSize: number,
  pageCount: number
): { treesSaved: number; co2Saved: number } => {
  // Constants
  const SHEETS_PER_TREE = 10000; // Average number of sheets produced from one tree
  const GRAMS_PER_SHEET = 5; // Average weight of an A4 sheet in grams
  const CO2_PER_KG_PAPER = 3.5; // kg of CO2 per kg of paper
  
  // Basic calculation based on page count
  // Each image becomes one page in our PDF
  const treesSaved = pageCount / SHEETS_PER_TREE;
  
  // Calculate CO2 savings (in kg)
  const paperWeight = (pageCount * GRAMS_PER_SHEET) / 1000; // Convert to kg
  const co2Saved = paperWeight * CO2_PER_KG_PAPER;
  
  return {
    treesSaved,
    co2Saved
  };
};

/**
 * Format the environmental impact for display
 * @param impact Environmental impact object
 * @returns Formatted string for display
 */
export const formatEnvironmentalImpact = (
  impact: { treesSaved: number; co2Saved: number }
): string => {
  // Format trees saved
  let treesText = '';
  if (impact.treesSaved < 0.001) {
    // If less than 0.001 trees, show as percentage of a tree
    const treePercentage = impact.treesSaved * 100;
    treesText = `${treePercentage.toFixed(4)}% of a tree`;
  } else if (impact.treesSaved < 0.01) {
    treesText = `${(impact.treesSaved * 100).toFixed(2)}% of a tree`;
  } else if (impact.treesSaved < 0.1) {
    treesText = `${(impact.treesSaved * 100).toFixed(1)}% of a tree`;
  } else if (impact.treesSaved < 1) {
    treesText = `${(impact.treesSaved * 100).toFixed(0)}% of a tree`;
  } else {
    // For 1 or more trees
    treesText = `${impact.treesSaved.toFixed(2)} trees`;
  }

  return treesText;
};