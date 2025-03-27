#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Default color mapping
const DEFAULT_COLOR_MAP = {
    '#ff0000': '#00ff00',    // Red to Green
    'red': 'blue',           // Named color
    'rgb(255, 0, 0)': 'rgb(0, 0, 255)',  // RGB format
    'rgba(255, 0, 0, 1)': 'rgba(0, 255, 0, 1)',  // RGBA format
    '#fff': '#000'           // Short hex
};

function replaceColors(svgContent, colorMap) {
    // Create a combined pattern to match all colors in the map
    const colorPatterns = Object.keys(colorMap).map(key => {
        // Escape special regex characters in the color string
        return key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('|');

    // Regex that specifically looks for fill="color" or fill='color' or fill=color
    const regex = new RegExp(`(fill\\s*=\\s*["']?)(${colorPatterns})(["']?)`, 'gi');

    return svgContent.replace(regex, (match, prefix, color, suffix) => {
        // Find the replacement (case-sensitive first, then case-insensitive)
        let replacement = colorMap[color];
        if (!replacement) {
            const lowerColor = color.toLowerCase();
            for (const key in colorMap) {
                if (key.toLowerCase() === lowerColor) {
                    replacement = colorMap[key];
                    break;
                }
            }
        }

        // Return original if no replacement found
        return replacement ? `${prefix}${replacement}${suffix}` : match;
    });
}

function processSvgFile(inputPath, colorMap, outputSuffix = '_modified') {
    try {
        const svgContent = fs.readFileSync(inputPath, 'utf8');
        const modifiedSvg = replaceColors(svgContent, colorMap);

        const parsedPath = path.parse(inputPath);
        const outputPath = path.join(
            parsedPath.dir,
            `${parsedPath.name}${outputSuffix}${parsedPath.ext}`
        );

        fs.writeFileSync(outputPath, modifiedSvg);
        console.log(`Modified SVG saved to: ${outputPath}`);
    } catch (error) {
        console.error('Error processing SVG file:', error.message);
        process.exit(1);
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 1 || args[0] === '--help') {
        console.log('Usage: node svgColorReplacer.js <input-file> [color-map-json] [output-suffix]');
        console.log('Example: node svgColorReplacer.js input.svg \'{"#ff0000":"#00ff00"}\' _red');
        process.exit(0);
    }

    const inputPath = args[0];
    let colorMap = DEFAULT_COLOR_MAP;
    let outputSuffix = '_modified';

    if (args[1]) {
        try {
            colorMap = JSON.parse(args[1]);
        } catch (e) {
            console.error('Invalid JSON color map provided. Using default.');
        }
    }

    if (args[2]) {
        outputSuffix = args[2];
    }

    processSvgFile(inputPath, colorMap, outputSuffix);
}

module.exports = { replaceColors, processSvgFile };