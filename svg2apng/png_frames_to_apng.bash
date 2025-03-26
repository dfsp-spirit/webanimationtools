#!/bin/bash
#
# Use ffmpeg to convert a sequence of PNG frames to an animated PNG (APNG) file.
#

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null
then
    echo "ffmpeg could not be found, please install it."
    exit
fi


# Default values
framerate=10
output_file="animated.png"
input_dir="./frames_tmp"

# Function to display help message
show_help() {
    echo "Convert a sequence of PNG frames to an animated PNG (APNG) file."
    echo "----------------------------------------------------------------"
    echo "Usage: $0 [--framerate <frame_rate>] [--output <output_file>] [--inputdir <input_dir>] [--help]"
    echo "This script requires ffmpeg to be installed and available on the system path."
    echo "* --framerate: The number of frames per second in the output animation. Positive integer, defaults to 10."
    echo "* --outputfile: The name of the output APNG file. Defaults to 'animated.png'."
    echo "* --inputdir: The directory containing the input PNG frames. Defaults to the current directory. Frames must be named 'frame_001.png', 'frame_002.png', etc. (You can start with index 000 or 001.)"
    echo "* --help: Show this help message."
    echo "Example: $0 --framerate 10 --output animation_out.png --inputdir ./frames_tmp"
    exit
}

# Parse named arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --framerate)
            if [[ "$2" =~ ^[0-9]+$ ]]; then
                framerate="$2"
                shift
            else
                echo "Error: The frame rate must be a positive integer."
                exit 1
            fi
            ;;
        --outputfile)
            output_file="$2"
            shift
            ;;
        --inputdir)
            input_dir="$2"
            shift
            ;;
        --help)
            show_help
            ;;
        *)
            echo "Unknown parameter: $1"
            show_help
            ;;
    esac
    shift
done

# Print the parsed arguments for debugging
echo "Frame rate: $framerate"
echo "Output file: $output_file"
echo "Input directory: $input_dir"


echo "Converting frames in directory '${input_dir}' to output file '${output_file}' with framerate ${framerate}..."
ffmpeg -y -framerate $framerate -i "${input_dir}/frame_%3d.png" -plays 0 -vf "fps=${framerate}" -f apng "${output_file}"
echo "Conversion complete. Check output file, e.g. run: 'firefox ${output_file}'"