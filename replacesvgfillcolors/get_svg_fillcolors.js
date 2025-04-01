/*
 * Script to extract all fill colors from an SVG file.
 * Writes the colors as a JSON dict to stdout. For each detected color, the dict contains a key/value pair, and both entries (key AND value) contain the detected color string.
 * This output format can be piped to a file and used as a template for the color replacement mapping required by the `replace_svg_fillcolors.js` script.
 */

const fs = require('fs');
const { parseString } = require('xml2js'); // Install with: npm install xml2js, or run 'npm ci' in directory.

async function extractFillColors(svgFilePath, normalizeColors) {
  try {
    // Read the SVG file
    const svgData = fs.readFileSync(svgFilePath, 'utf8');
    
    // Parse SVG XML
    const result = await new Promise((resolve, reject) => {
      parseString(svgData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Dictionary to store fill colors
    const colorMap = {};

    // Recursive function to traverse the SVG tree
    function traverse(obj) {
      if (typeof obj !== 'object' || obj === null) return;

      // Check if current object has a fill attribute
      if (obj.$ && obj.$.fill && isValidColor(obj.$.fill)) {
        const color = normalizeColors ? normalizeColor(obj.$.fill) : obj.$.fill;
        colorMap[color] = color; // Add to dictionary as both key and value
      }

      // Recursively check all properties
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach(item => traverse(item));
        } else {
          traverse(obj[key]);
        }
      }
    }

    traverse(result);
    return colorMap;

  } catch (err) {
    console.error('Error processing SVG:', err);
    return {};
  }
}

// Helper function to validate colors (basic check to ignore certain special values)
function isValidColor(color) {
  return color !== 'none' && color !== 'currentColor' && 
         !color.startsWith('url(') && color !== 'inherit' && color !== 'freeze';
}

// Helper function to normalize color formats
function normalizeColor(color) {
  // Convert rgb() to hex if needed
  if (color.startsWith('rgb(')) {
    const rgb = color.match(/\d+/g);
    if (rgb && rgb.length === 3) {
      return `#${rgb.map(x => 
        parseInt(x).toString(16).padStart(2, '0')
      ).join('')}`;
    }
  }
  // Convert shorthand hex to full form
  if (/^#([0-9a-f]{3})$/i.test(color)) {
    return color.replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i, '#$1$1$2$2$3$3');
  }
  return color;
}

// Example usage:
// 

// Main execution
if (require.main === module) {
    const fs = require('fs');
    const args = process.argv.slice(2);

    if (args.length < 1 || args[0] === '--help') {
        console.log('Usage: node get_svg_fillcolors.js <input-file.svg>');
        console.log('  Output will be written to STDOUT.')
        process.exit(0);
    }
    const normalizeColors = false;

    const inputPath = args[0];
    if (! fs.existsSync(inputPath)) {
        console.log(`Input file '${inputPath}' does not exist or cannot be read. Exiting.`);
        process.exit(1);
    }

    extractFillColors(inputPath, normalizeColors).then(colors => console.log(JSON.stringify(colors, null, 2)));
}