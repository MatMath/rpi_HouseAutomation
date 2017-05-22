# House automation
This will control some motor, light detector, a USB camera to automate the house.

## Flow
Motors:
In the morning (light), Open the blind.
  - On a Schedule (easy to start)
  - On manual trigger later (via API)

Front of the house : (using movement detector to trigger)
On movement in the front take a picture/Record a video

Door Camera + Led lighting:
On Movement next to the door Take a picture/Video & Open the Led light / (Text picture ?).

Data management:
When the info is save to a folder, synch the folder to S3 or GDrive or ???
If a Connection to Bluetooth deactivate the system or part of it.
Make analysis on the file like:
- OpenCV Face recon
- Count the number of people passing by per day and match the face if possible (catalog).

## Future / InProgess:
- Server to save the important data
- Server interface to show graph of different stats

## Install on Pi.
Note: Remember this is an ARM V8 processor on Raspberry PI3-B, so node will install, but not the package to read the pin.
From a fresh install of Pi I was able to make it run with:
- apt-get update
- apt-get upgrade
- install node with what you like "nvm" or "n"
- Git clone / npm install
- Copy simpleAuth.sample.json to simpleAuth.json
- Install & setup Motion: https://motion-project.github.io/ with the right output directory.
- Setup/Configure AWS CLI with sudo (http://docs.aws.amazon.com/cli/latest/userguide/installing.html).
- To make it run on ssh: $ nohup node bin/www &

## Problem:
With Ubuntu 16.04 At reboot I had a "U-Boot" loop. Fixed with: https://raspberrypi.stackexchange.com/questions/61342/raspberry-pi-3-ubuntu-16-04-server-upgrade-error. But now I use Raspian.

## GPIO:
I will use the Command line with:
- git clone git://git.drogon.net/wiringPi
- cd wiringPi
- ./build
And using it with: gpio -v, gpio readall, gpio -g mode 2 out, gpio -g write 2 1   (see more at http://wiringpi.com/the-gpio-utility/)
Benefit: I don't have to use sudo anymore.
Problem: I don't have an event emitter I have to loop check.

## Setup of Motion:
Change the Path of the output to be the same as the AWS sync folder.
Setup to only capture video of a few sec.
Changed the Width-Height of the img capture.
framerate: 5
minimum_motion_frames: 3

## Design History:
Initial design was to use pi-gpui or rpi-gpio to control the GPIO pins, but that was harder than expected since it failed to work and also need SUDO to run and that is bad practice to run Node as sudo. So I ended-up using wiringPi as childProcess.
Trying to use "fswebcam" to capture the frame, but I needed to discard the first few frames so the camera adjust the brightness. So a lot of time waisted between frames.
So I decided to use "Motion" https://motion-project.github.io/ and it was way simpler to setup and use. (so now I dont need my motion sensor anymore, except for the door).
