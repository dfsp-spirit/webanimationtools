# webanimationtools

Some tools and proof-of-concept code for web bases animations.

See the README file of the different tools for details and installation instructions for dependencies:

* [svg2apng](./svg2apng): convert an animated SVG file to an APNG file.
    * Includes two scripts, one to convert the SVG to a series of PNG images, and a second one that converts those PNG images into a single APNG file.
* [replacesvgfillcolors](./replacesvgfillcolors): replace fill colors in a n SVG file to create a new, re-colored version of the image

![Animated robot](./images/robot_a.png)


## Quick install instructions for Debian/Ubuntu:

This way of installing uses [nvm](https://github.com/nvm-sh), the node version manager.

```shell
sudo apt install curl ffmpeg git
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
bash # start a new shell so that your config files, modified by above command, get re-evaluated.
nvm install node # or some specific version you prefer, the nvm docs.
```

Then, in the directories of the respective tool you want to use, run ```npm ci``` and read the README file in the tool directory for usage instructions. E.g.:

```shell
git clone https://github.com/dfsp-spirit/webanimationtools.git
cd webanimationtools/svg2apng/
npm ci
```


