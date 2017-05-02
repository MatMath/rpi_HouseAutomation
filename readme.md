# House automation
This will control some motor, light detector, a USB camera to automate the house.

## Flow
Motors:
In the morning (light), Open the blind.
  - On a Schedule (easy to start)
  - On trigger later (harder but flexible)
  - Average of the last minute of reading with threshold
Overwrite switch if we want to let them open/close?.
Light Sensor:  
In the evening (dark), close the blind. (same)

Camera:
On movement take a picture/Record a video
Door Camera + Led lighting:
On Movement next to the door Take a picture/Video & Open the Led light / (Text picture ?).

Data management:
When the info is save to a folder, synch the folder to S3 or GDrive or ???
If a Connection to Bluetooth deactivate the system or part of it.
Make analysis on the file like:
- OpenCV Face recon
- Count the number of people passing by per day and match the face if possible (catalog).


## Install on Pi.
Note: Remember this is an ARM V8 processor on Raspberry PI3-B, so node will install, but not the package to read the pin.
I tried Raspian, Ubuntu Core snap, and Ubuntu 16.04 and all had the same problem on all of them, I could not use nvm to install node otherwise epoll doesn't install properly (and many other). From a fresh install of Pi I was able to make it run with:
- 16.04 pre-installed Ubuntu from https://wiki.ubuntu.com/ARM/RaspberryPi
- apt-get update
- apt-get upgrade
- apt install nodejs
- apt install nodejs-legacy
- apt install npm
- Git clone / npm install
- Run the code as SUDO otherwise rpi-gpio doesn't work.

But this only give me Node 4.2.6. To have the latest version you can use "nvm" or "n" but you need to install node as SUDO otherwise npm will not be able to install some package like epoll and rpi-gpio. Yes installing node as Sudo is bad practice but it need to be accessible from "SUDO" cmd.

## Problem:
At reboot I had a "U-Boot" loop. Fixed with: https://raspberrypi.stackexchange.com/questions/61342/raspberry-pi-3-ubuntu-16-04-server-upgrade-error


## GPIO Problems:
I tried hard to make rpi-gpio or pi-gpio work and no success. I was able to read but not to write even in sudo so after a while I gave up and switch tactics (almost switch to python :| ).
I will use the Command line with:
- git clone git://git.drogon.net/wiringPi
- cd wiringPi
- ./build
And using it with: gpio -v, gpio readall, gpio -g mode 2 out, gpio -g write 2 1
Benefit: I don't have to use sudo anymore.
