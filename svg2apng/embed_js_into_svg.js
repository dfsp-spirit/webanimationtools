const fs = require('fs');
const path = require('path');



// Main function to process files
function main() {
    // Get file path from command line arguments
    const filePath = process.argv[2];

    if (!filePath) {
        console.log('Usage: node embedScript.js <svg-file-path>');
        process.exit(1);
    }

    // Check if file exists and is SVG
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        process.exit(1);
    }

    if (path.extname(filePath).toLowerCase() !== '.svg') {
        console.log(`File is not an SVG: ${filePath}`);
        process.exit(1);
    }

    processSvgFile(filePath);
}

main();