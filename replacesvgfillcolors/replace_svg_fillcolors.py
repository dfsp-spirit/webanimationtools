import sys
import re

def replace_colors(svg_content, color_map):
    """
    Replace fill colors in the given SVG content based on the color_map.

    Args:
        svg_content (str): The original SVG content.
        color_map (dict): A dictionary mapping old colors to new colors.

    Returns:
        str: The modified SVG content with replaced colors.
    """
    def replace_match(match):
        color = match.group(1)
        return f'fill="{color_map.get(color, color)}"'

    # Match fill="rgb(x, y, z)" and fill="#xxxxxx"
    pattern = r'fill="(rgb\(\d+,\s*\d+,\s*\d+\)|#[0-9a-fA-F]{6})"'
    return re.sub(pattern, replace_match, svg_content)

def main():
    if len(sys.argv) != 3:
        print("Usage: python replace_svg_colors.py <input_svg> <output_svg>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    # Define the color replacement mapping
    color_map = {
        "rgb(124, 190, 178)": "rgb(172, 225, 217)",  # Pastel teal
        "rgb(217, 167, 81)": "rgb(242, 210, 151)",  # Pastel orange
        "gray": "rgb(211, 211, 211)",  # Light gray (softened)
        "white": "rgb(255, 255, 255)",  # White (unchanged)
        "rgb(200, 200, 200)": "rgb(230, 230, 230)",  # Lighter gray
        "rgb(148, 167, 203)": "rgb(190, 200, 230)"  # Pastel blue
    }


    try:
        with open(input_file, "r", encoding="utf-8") as f:
            svg_content = f.read()

        modified_svg = replace_colors(svg_content, color_map)

        with open(output_file, "w", encoding="utf-8") as f:
            f.write(modified_svg)

        print(f"Updated SVG saved to {output_file}")

    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
