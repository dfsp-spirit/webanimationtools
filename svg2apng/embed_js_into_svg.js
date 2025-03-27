const fs = require('fs');
const path = require('path');

// The script to insert
const scriptToInsert = `<script type="application/ecmascript">
        <![CDATA[
        function stepAnimation() {
            document.documentElement.setCurrentTime(document.documentElement.getCurrentTime() + 1/30);
        }
        ]]>
    </script>`;

// Function to process a single SVG file
function processSvgFile(filePath) {
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