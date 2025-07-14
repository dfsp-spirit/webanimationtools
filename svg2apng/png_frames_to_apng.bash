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
input_dir="./"
input_file_prefix="frame_"
input_file_suffix="%3d.png"
input_file_pattern=""

# Function to display help message
show_help() {
    echo "Convert a sequence of PNG frames to an animated PNG (APNG) file."
    echo "----------------------------------------------------------------"
    echo "Usage: $0 [--framerate <frame_rate>] [--output <output_file>] [--inputdir <input_dir>] [--help]"
    echo "This script requires ffmpeg to be installed and available on the system path."
    echo "* --framerate: The number of frames per second in the output animation. Positive integer, defaults to 10."
    echo "* --outputfile: The name of the output APNG file. Defaults to 'animated.png'."
    echo "* --inputdir: The directory containing the input PNG frames. Defaults to the current directory. Unless you also set --inputfileprefix, the prefix defaults to 'frame_', so the frames in the directory must be named 'frame_001.png', 'frame_002.png', etc. (You can start with index 000 or 001.)"
    echo "* --inputfilepattern <pattern>: The pattern to match input files within inputdir. If set, it overrides --inputfileprefix and --inputfilesuffix. The pattern should be a valid ffmpeg pattern, e.g., 'frame_%3d.png'." for file names like frame_001.png, frame_002.png, etc.
    echo "* --inputfileprefix <prefix>: set input files prefix to <prefix>. The default suffix '%3d.png' will be appended to look for the set of input files, unless --inputfilesuffix is also given. If omitted, defaults to 'frame_'. See also --inputfilepattern as an alternative way to set both prefix and suffix at once."
    echo "* --inputfilesuffix <suffix>: set input files suffix to <suffix>. Defaults to '%3d.png'. The default prefix 'frame_' will be prepended, unles --inputfileprefix is also given. If omitted, defaults to '%3d.png'. See also --inputfilepattern as an alternative way to set both prefix and suffix at once."
    echo "* --help: Show this help message."
    echo "Example: $0 --framerate 10 --outputfile animation_out.png --inputdir ./frames_tmp"
    exit
}

if [ -z "$1" ]; then
    echo "No arguments provided. Use --help to see usage."
    exit 1
fi

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
        --inputfileprefix)
            input_file_prefix="$2"
            shift
            ;;
        --inputfilesuffix)
            input_file_suffix="$2"
            shift
            ;;
        --inputfilepattern)
            input_file_pattern="$2"
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

# If --inputfilepattern is not set, construct the input file pattern from prefix and suffix.
if [ -z "$input_file_pattern" ]; then
    echo "Input file prefix: $input_file_prefix"
    echo "Input file suffix: $input_file_suffix"
    input_file_pattern="${input_dir}/${input_file_prefix}{$input_file_suffix}"
fi

echo "Input file pattern: ${input_file_pattern}"

echo "Converting frames in directory '${input_dir}' to output file '${output_file}' with framerate ${framerate}..."
ffmpeg -y -framerate $framerate -i "${input_dir}/${input_file_pattern}" -plays 0 -vf "fps=${framerate}" -f apng "${output_file}"
echo "Conversion complete. Check output file, e.g. run: 'firefox ${output_file}'"
