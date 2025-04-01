# replacesvgfillcolors -- Replace fill colors in an SVG file

Simple script to create a new color variant from an existing SVG file. Works by replacing fill colors based on a replacement mapping.

A color replacement mapping is a JSON dictionary like the following one:

```
{
  'rgb(124, 190, 178)': 'rgb(124, 190, 178)',
  'rgb(148, 167, 203)': 'rgb(148, 167, 203)',
  'rgb(217, 167, 81)': 'rgb(217, 167, 81)',
  white: 'white',
  black: 'black',
  gray: 'gray'
}
```


## Installation

* Make sure you have `npm` installed, if not get the LTS from the [node website](https://nodejs.org/), from your package manager on a recent Linux distribution, or via [nvm](https://github.com/nvm-sh/nvm) under Linux. I used v10.9.2.
* Install JavaScript dependencies via npm. In this directory, run: ```npm ci```


## Usage


Get all fill colors from your existing SVG file, so you can have a template for the replacement mapping:

```shell
node get_svg_fillcolors.js myimage.svg > colormapping.json
```

Now edit the file `colormapping.json` with your color mapping. Find a new color schema with websites like Adobe Color/Kooler/whatever you prefer. Then, apply your mapping:

```shell
node replace_svg_fillcolors.js myimage.svg --file colormapping.json
```

This will write the modified (re-colored) file to `myimage_modified.svg`


