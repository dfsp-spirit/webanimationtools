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

function processSvgFile(inputPath, colorMap, outputSuffix = '_recolored') {
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
    const fs = require('fs');
    const args = process.argv.slice(2);

    if (args.length < 1 || args[0] === '--help') {
        console.log('Usage: node svgColorReplacer.js <input-file> [<color-map-json>|--file <file.json>] [<output-suffix>]');
        console.log('  <input-file>     : The input SVG file with fill colors that should be replaced.')
        console.log('  <color-map-json> : The JSON color replacement dict as a string, properly shielded from shell expansion of special characters by quoting (single ticks for most shells). Example: \'{"#ff0000":"#00ff00","blue":"red"}\'')
        console.log('  <output-suffix>  : Optional. A suffix to append to the input file basename to construct the output file name. E.g., with input file \'robot.svg\' and suffix \'_red\', you will get output file \'robot_red.svg\'. Defaults to \'_recolored\'.');
        console.log('Examples:');
        console.log('  node svgColorReplacer.js input.svg \'{"#00ff00":"#ff0000","blue":"red"}\' _red');
        console.log('  node svgColorReplacer.js input.svg --file colors.json');
        console.log('  node svgColorReplacer.js input.svg --file colors.json _red');
        console.log('If you supply the color mapping via --file, the contents of that file should be just a single JSON dict like: \'{"#00ff00":"#ff0000","blue":"red"}\'')
        console.log()
        process.exit(0);
    }

    const inputPath = args[0];
    let colorMap = DEFAULT_COLOR_MAP;
    let outputSuffix = '_recolored';

    // Check for --file option
    const fileArgIndex = args.indexOf('--file');
    if (fileArgIndex !== -1) {
        // Read color map from file
        if (fileArgIndex + 1 >= args.length) {
            console.error('Error: --file option requires a filename');
            process.exit(1);
        }
        
        const colorMapFile = args[fileArgIndex + 1];
        try {
            const fileContent = fs.readFileSync(colorMapFile, 'utf8');
            colorMap = JSON.parse(fileContent);
        } catch (e) {
            console.error(`Error reading or parsing color map file: ${e.message}`);
            process.exit(1);
        }
    } else if (args[1] && !args[1].startsWith('--')) {
        // Parse color map from command line argument
        try {
            colorMap = JSON.parse(args[1]);
        } catch (e) {
            console.error('Invalid JSON color map provided. Using default.');
        }
    }

    // Get output suffix (skip the file args if they were used)
    const suffixArgIndex = fileArgIndex !== -1 ? fileArgIndex + 2 : 2;
    if (args[suffixArgIndex]) {
        outputSuffix = args[suffixArgIndex];
    }

    console.log(`Processing input file '${inputPath}' and adding output suffix '${outputSuffix}' to output file.`)
    console.log(`Using color map: ${JSON.stringify(colorMap, null, 2)}`)
    processSvgFile(inputPath, colorMap, outputSuffix);
}

module.exports = { replaceColors, processSvgFile };