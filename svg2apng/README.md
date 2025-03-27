# Graphics -- Creating an animated PNG image from an animated SVG


![Animated Robot in PNG format](../images/robot_a.png)


The tools in this directory convert an animated SVG file to an animated PNG file.

This is a two-step process:

* First, a small node script that generates PNG frames from an animated SVG.
    - Technically this is achieved via puppeteer, via taking 'screenshots' of the animation running in a headless (no visible UI) browser.
* Then, ffmpeg is used to encode these frames to a animated PNG (APNG) file.

The software in this repo can be used under Linux and MacOS, and with a bit of an extra effort under Windows as well (if you have a bash shell, like the MINGW bash that comes with Git for Windows).

## Installation

* Make sure you have `npm` installed, if not get the LTS from the [node website](https://nodejs.org/) or from your package manager on a recent distribution. I used v10.9.2.
* Make sure you have `ffmpeg` installed and on your PATH.
   - Under Linux you most likely already have it, otherwise install from your package manager (Debian/Ubuntu `sudo apt install ffmpeg`).
   - Under Windows you could use chocolate to install it, or manually install a Windows build from the [ffmpeg website](https://www.ffmpeg.org/).
   - Under MacOS Homebrew is most likely your best option, or check the [ffmpeg website](https://www.ffmpeg.org/).
* Install JavaScript dependencies via npm. In this directory, run: ```npm ci```


## Usage

Have your svg file ready and run the `run.bash` wrapper script to carry out the full conversion. Typical usage:

```shell
./run.bash --outputfile out.png input.svg
```

Run `./run.bash --help` to see available options for changing screenshot capture rate and dealy, as well as output frames per second for the APNG file. You **will** need to tweak those depending on the length of the animation to get good results. The help command shows various explained example command lines.


### Manually running the sub scripts

The `run.bash` script internally runs two other scripts. It should not be needed to interact with them directly, but if you feel like it, here is how to do it:


* Run the first script: ```node anim_svg_to_png_frames.js```
    - This generates the frames (a set of non-animated PNG files named `frame_IDX.png`, where `IDX` is a running index)
    - Run with `--help` to see available options.
* Run the ffmpeg script: ```./png_frames_to_apng.bash```
    - This combines all PNG frames into a single APNG file named `animated.png`
    - Run with `--help` to see available options.
* Delete the frames to avoid potential issues next time you use the scripts: ```rm frame_*.png```


The ffmpeg script creates an output file named `animated.png` by default (if `--outputfile` was not used). Make sure to view this APNG file in a suitable application, like Firefox or Chrome.

Note: Software like MS Paint that does not support APNG will not display the animation, and typically shows only the first frame.


