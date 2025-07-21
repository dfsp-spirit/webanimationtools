# webanimationtools

Some tools and proof-of-concept code for web bases animations.

See the README file of the different tools for details and installation instructions for dependencies:

* [svg2apng](./svg2apng): convert an animated SVG file to an APNG file.
    * Includes two scripts, one to convert the SVG to a series of PNG images, and a second one that converts those PNG images into a single APNG file.
* [replacesvgfillcolors](./replacesvgfillcolors): replace fill colors in a n SVG file to create a new, re-colored version of the image

![Animated robot](./images/robot_a.png)


## Quick install instructions for Debian/Ubuntu:


Install system dependencies and tools:

```shell
sudo apt install curl ffmpeg git
```

Install node if you don't have it (no ```npm``` command), or if you get errors about your ```npm``` being outdated during ```npm ci``` below.

If you have an outdated npm, most likely installed via apt, remove that first to avoid clashes (e.g., ```sudo apt remove node``` if you installed it via apt).

This way of installing node uses [nvm](https://github.com/nvm-sh), the node version manager.

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
bash # start a new shell so that your config files, modified by above command, get re-evaluated.
nvm install node # or some specific version you prefer, the nvm docs.
```

Now you have everything you need on the system level.

Clone the source repo. Then, in the directory of the respective tool you want to use, run ```npm ci``` to install the node/JS dependencies:

```shell
git clone https://github.com/dfsp-spirit/webanimationtools.git
cd webanimationtools/svg2apng/
npm ci
```

Now read the README file in the tool directory for usage instructions.

## Related software

* [apngasm](https://github.com/apngasm/apngasm)


