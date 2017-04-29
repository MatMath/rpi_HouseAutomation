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
- apt install nodejs
- apt install nodejs-legacy
- apt-get update
- apt-get upgrade
- apt install npm
- Git clone / npm install
- Run the code as SUDO otherwise rpi-gpio doesn't work.

But this only give me Node 4.2.6 so why??? Well I tried to use nvm directly from the start and on All platform it was broken. BUT if the code of rpi-gpio work with 4.2 then use nvm and upgrade node to 7.9 and it will still work. There is some stuff that "apt" install that nvm doesn't.
