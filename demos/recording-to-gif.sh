#!/bin/bash

# Check if user provided a file name
if [ -z "$1" ]; then
    echo "Please provide a video file name"
    exit 1
fi

# Set default scale-down factor (proportional to video size)
scale=2

# Check if user provided a scale-down parameter
if [ ! -z "$2" ]; then
    scale=$2
fi

# Get input file name without extension
input_file="${1%.*}"

# Set output file name with .gif extension
output_file="$input_file.gif"

# Use FFmpeg to make the GIF
ffmpeg -i "$1" -vf "setpts=0.5*PTS,fps=15,scale=iw/${scale}:ih/${scale}:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "$output_file"

echo "GIF conversion complete. Output file: $output_file"
