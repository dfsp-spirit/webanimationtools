#!/bin/bash
#
# Wrapper script to run both `node anim_svg_to_png_frames.js` and `png_frames_to_apng.bash` to convert an animated SVG to an animated PNG.
#
# Suuports passing on the named arguments to the two scripts.
# The script requires `ffmpeg` and `node` to be installed and available on the system path.
# It uses fixed temporary dictionary `./frames_tmp` to store the PNG frames.
#
# Written by Tim Schäfer, 2025-03-24

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null
then
    echo "ffmpeg could not be found, please install it."
    exit
fi

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "node JS could not be found, please install it."
    exit
fi

# Function to display help message
show_help() {
    echo "Convert an animated SVG to an animated PNG (APNG) file."
    echo "-------------------------------------------------------"
    echo "Usage: $0 [--numframes <numframes>] [--delay <delay>] [--outputfile <output_file>] [--framerate <frame_rate>] [--help] <inputfile.svg>"
    echo "This script requires ffmpeg and node to be installed and available on the system path."
    echo "* --numframes: The number of frames to capture from the input SVG animation. Positive integer, defaults to 10."
    echo "* --delay: The delay between frames when capturing screenshots from the input SVG animation. Positive integer (in ms), defaults to 100."
    echo "* --outputfile: The name of the output APNG file. Defaults to the name of the input file with the file extension '.svg replaced by '.png'."
    echo "* --framerate: The number of frames per second in the output animation. Positive integer, defaults to 10."
    echo "* --help: Show this help message and exit."
    echo "* inputfile.svg: The input animated SVG file to be converted to an animated PNG. Required. Must have file extension '.svg' unless --outputfile is specified."
    echo "Examples:"
    echo "  1) Capture 5 frames with 200ms delay (1 second duration @5fps) of the input animation, write output APNG with 5 fps (which will also be 1 second long):"
    echo       "$0 --numframes 5 --delay 200 --outputfile animation_out.png --framerate 5 input.svg"
    echo "  2) Capture 20 frames with 100ms delay (2 seconds @10fps) of the input animation, write output APNG with 10 fps (which will also be 2 seconds long):"
    echo       "$0 --numframes 20 --delay 100 --outputfile animation_out.png --framerate 10 input.svg"
    echo "  2) Capture 20 frames with 100ms delay (2 seconds @10fps) of the input animation, write output APNG which has the playback rate doubled (only 1 second duration @20fps):"
    echo       "$0 --numframes 20 --delay 100 --outputfile animation_out.png --framerate 20 input.svg"
    exit
}

delay=100   # delay in milliseconds between frames, passed to JS script
numframes=10  # number of frames, passed to JS script
framerate=5 # default frame rate for output APNG, passed to bash script/ffmpeg
input_file=""
output_file=""
html_file=""

# Parse named arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --numframes)
            if [[ "$2" =~ ^[0-9]+$ ]]; then
                numframes="$2"
                shift
            else
                echo "Error: The number of animation frames to capture from the input SVG animation given with '--numframes' must be a positive integer."
                exit 1
            fi
            ;;
        --delay)
            if [[ "$2" =~ ^[0-9]+$ ]]; then
                delay="$2"
                shift
            else
                echo "Error: The delay between frames when capturing screenshots from the input SVG animation given with '--delay' must be a positive integer (in ms)."
                exit 1
            fi
            ;;
        --framerate)
            if [[ "$2" =~ ^[0-9]+$ ]]; then
                framerate="$2"
                shift
            else
                echo "Error: The output APNG framerate given with '--framerate' must be a positive integer."
                exit 1
            fi
            ;;
        --outputfile)
            output_file="$2"
            shift
            ;;
        --htmlfile)
            html_file="$2"
            shift
            ;;
        --help)
            show_help
            ;;
        *) # Assume the remaining argument is the input file
            input_file="$1"
            ;;
    esac
    shift
done

if [ ! -n "$input_file" ]; then
    show_help
fi


if [ ! -f "$input_file" ]; then
    echo "Error: Input SVG file '$input_file' not found."
    exit
fi

# Construct output file name by replacing file extension '.svg' with '.png'
if [ -z "$output_file" ]; then
    output_file="${input_file/.svg/.png}"
fi

if [ -z "$html_file" ]; then
    html_file="${input_file/.svg/.html}"
fi

# Double check that output file name is not identical to input file name
if [ "$input_file" == "$output_file" ]; then
    echo "Error: Input and output file names are identical. Please ensure input file ends with file extension '.svg' or manually specify an output file with '--outputfile'."
    exit
fi
if [ "$input_file" == "$html_file" ]; then
    echo "Error: Input and HTML file names are identical. Please ensure input file ends with file extension '.svg' or manually specify an output HTML file with '--htmlfile'."
    exit
fi

# Delete frames in the temporary directory if they exist. Do not delete the directory itself.
# This is needed in case old frames are present from a previous run.
rm -f ./frames_tmp/frame_*.png


# Convert the animated SVG to a sequence of PNG frames
node anim_svg_to_png_frames.js --numframes $numframes --delay $delay --svgfile "$input_file" --outputdir "./frames_tmp"
./png_frames_to_apng.bash --framerate $framerate --outputfile "${output_file}" --inputdir "./frames_tmp"


generate_html() {
    local html_file="$1"
    local svg_file="$2"
    local title="${3:-$html_file}"
    local subtitle="${4:-$html_file}"

    cat > "$html_file" <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title</title>
    <style>
        body {
            background-color: #dcdcdc;
            text-align: center;
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        img {
            max-width: 100%;
            height: auto;
            border: 1px solid #000;
        }
    </style>
</head>
<body>
    <h1>$title</h1>
    <img src="$svg_file" alt="SVG Image">
    <h3>$subtitle</h3>
</body>
</html>
EOF
}

generate_html "${html_file}" "${output_file}" "Displaying file '${output_file}' ($numframes frames at $framerate fps)" "Based on input file '${input_file}', captured $numframes frames with delay $delay ms."




