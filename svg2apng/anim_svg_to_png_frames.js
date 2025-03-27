// Capture frames from an SVG file and save them as PNG images
// Requires that the SVG file has an embedded Javascript section with a function to advance the animation.
// This looks like this in the SVG header:
//
//<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
//    <script type="application/ecmascript">
//        <![CDATA[
//        function stepAnimation() {
//            document.documentElement.setCurrentTime(document.documentElement.getCurrentTime() + 1/30);
//        }
//        ]]>
//    </script>
//  more SVG content here
//

const puppeteer = require('puppeteer');
const path = require('path'); // Add the path module for cross-platform file paths
const fs = require('fs');

// Default values
let numFrames = 20;
let delay = 100;
let svgFile = 'robot.svg';
let outputDir = path.join(__dirname, 'frames_tmp');



// The JS script to embed at the top of the SVG files.
const scriptToInsert = `<script type="application/ecmascript">
        <![CDATA[
        function stepAnimation() {
            document.documentElement.setCurrentTime(document.documentElement.getCurrentTime() + 1/30);
        }
        ]]>
    </script>`;


// Function to embed the script into a single SVG file
function embedJsIntoSvgFile(filePath) {
    try {
        // Read the file content
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if the function already exists in any script tag
        const functionExists = /<script[^>]*>[\s\S]*?\bfunction\s+stepAnimation\s*\([^)]*\)[\s\S]*?<\/script>/i.test(content);

        if (!functionExists) {
            // Find the opening SVG tag (may span multiple lines and have attributes)
            const svgTagRegex = /<svg[\s\S]*?>/i;
            const svgTagMatch = content.match(svgTagRegex);

            if (svgTagMatch) {
                const svgTag = svgTagMatch[0];
                // Insert the script right after the SVG opening tag
                const newContent = content.replace(svgTag, `${svgTag}\n${scriptToInsert}`);

                // Write the modified content back to the file
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`Updated: ${filePath}`);
            } else {
                console.log(`No SVG tag found in: ${filePath}`);
            }
        } else {
            console.log(`Function already exists, skipping: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
    }
}

/**
 * Creates a backup of a file by copying it to [filename].backup
 * @param {string} filePath - Path to the original file
 * @returns {object} { success: boolean, message: string, backupPath: string }
 */
function createBackup(filePath, allowOverwrite = true) {
    try {
        const backupPath = `${filePath}.backup`;

        // Check if original file exists
        if (!fs.existsSync(filePath)) {
            return {
                success: false,
                message: `Original file not found: ${filePath}`,
                backupPath: null
            };
        }

        // Check if backup already exists to avoid overwriting
        if (fs.existsSync(backupPath)) {
            if(! allowOverwrite) {
                return {
                    success: false,
                    message: `Backup already exists and allowOverwrite is false: ${backupPath}`,
                    backupPath: null
                };
            } else {
                // Delete existing backup
                fs.unlinkSync(backupPath);
            }
        }

        // Create backup (using copyFileSync for atomic operation)
        fs.copyFileSync(filePath, backupPath);

        return {
            success: true,
            message: `Backup created: ${backupPath}`,
            backupPath: backupPath
        };
    } catch (err) {
        return {
            success: false,
            message: `Backup failed for ${filePath}: ${err.message}`,
            backupPath: null
        };
    }
}

// Restore a file with a .backup extension to its original state.
function restoreFromBackup(backupPath) {
    const originalPath = backupPath.replace(/\.backup$/, '');
    fs.copyFileSync(backupPath, originalPath);
    console.log(`Restored ${originalPath} from backup`);
}


// Parse command-line arguments
process.argv.forEach((arg, index) => {
    if (arg === '--numframes' && process.argv[index + 1]) {
        numFrames = parseInt(process.argv[index + 1], 10);
    } else if (arg === '--delay' && process.argv[index + 1]) {
        delay = parseInt(process.argv[index + 1], 10);
    } else if (arg === '--svgfile' && process.argv[index + 1]) {
        svgFile = 'file://' + path.join(__dirname, process.argv[index + 1]);
    } else if (arg === '--outputdir' && process.argv[index + 1]) {
        outputDir = path.join(__dirname, process.argv[index + 1]);
    } else if (arg === '--help' || arg === '-h') {
        console.log('Usage: node anim_svg_to_png_frames.js [--numframes <num_frames>] [--delay <delay>] [--svgfile <svgFile>] [--outputdir <outputDir>]');
        console.log('  --numframes: Number of frames to capture via screenshots (default: 20)');
        console.log('  --delay: Delay between frame capture events (screenshots) in milliseconds (default: 100)');
        console.log('  --svgfile: SVG file to capture animation frames from, relative to current dir (default: robot.svg)');
        console.log('  --outputdir: Directory to save the resulting PNG frames (screenshots) to, relative to current dir (default: current dir). Must exist and be writable.');
        console.log('  --help, -h: Show this help message');
        console.log('Example: node anim_svg_to_png_frames.js --numframes 20 --delay 120 --svgfile robot_anim_in.svg --outputdir frames');
        process.exit(0);
    }
});

// Check if SVG file exists
if (!fs.existsSync(svgFile.replace('file://', ''))) {
    console.error(`Error: SVG file "${svgFile}" not found.`);
    process.exit(1); // Exit with an error code
}

// Check if output directory exists
if (!fs.existsSync(outputDir)) {
    console.error(`Error: Output dir "${outputDir}" not found.`);
    process.exit(1); // Exit with an error code
}

const backupResult = createBackup(svgFile.replace('file://', ''));
if (!backupResult.success) {
    console.error(`Aborted due to failure while trying to create backup of input SVG file: ${backupResult.message}`);
    process.exit(1);
}

const backupPath = backupResult.backupPath;

embedJsIntoSvgFile(svgFile.replace('file://', ''));
console.log('SVG file updated with animation script.');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(svgFile);

    // Set viewport size based on SVG dimensions to avoid extra whitespace
    const svgSize = await page.evaluate(() => {
        const svg = document.querySelector('svg');
        return { width: svg.width.baseVal.value, height: svg.height.baseVal.value };
    });
    await page.setViewport({ width: svgSize.width, height: svgSize.height });

    console.log('Capturing', numFrames, 'Frames with delay of', delay, 'ms.');
    console.log('SVG file:', svgFile);
    console.log('Output directory:', outputDir);
    console.log('SVG dimensions (and viewport size):', svgSize.width, 'x', svgSize.height);

    for (let i = 0; i < numFrames; i++) {
        let outputFilename = path.join(outputDir, `frame_${i.toString().padStart(3, '0')}.png`);
        await page.screenshot({ path: outputFilename, omitBackground: true });
        await page.evaluate(() => new Promise(requestAnimationFrame)); // Advance one frame
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log('* ' + (i+1) + ' frames captured, writing generated image to ' + outputFilename);
    }

    await browser.close();
    console.log('All', numFrames, 'Frames captured!');
})();

// Restore the original SVG file
restoreFromBackup(backupPath);
console.log('Done converting SVG to PNG frames for input file:', svgFile);