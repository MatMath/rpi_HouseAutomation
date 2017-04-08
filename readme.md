# House automation
This will control some motor, light detector, a USB camera to automate the house.

## Flow
In the morning (light), Open the blind.
  - On a Schedule (easy to start)
  - On trigger later (harder but flexible)
  - Average of the last minute of reading with threshold
In the evening (dark), close the blind. (same)
Overwrite switch if we want to let them open/close?.
On movement take a picture/Record a video
On Movement next to the door Take a picture/Video & Open the Led light / (Text picture ?).
When the info is save to a folder, synch the folder to S3 or GDrive or ???
If a Connection to Bluetooth deactivate the system or part of it.
Make analysis on the file like:
- OpenCV Face recon
- Count the number of people passing by per day and match the face if possible (catalog).
