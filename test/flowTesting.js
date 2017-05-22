// This is to test the flow of the camera since I seems to have problem with the USB capture (saturated, not taking img and all other)

const { execSync } = require('child_process');
const { diskUtility } = require('../config.json');
const fs = require('fs');

const now = Date.now();
fs.mkdirSync(`${diskUtility.saveImgPath}/testing`);
execSync(`sudo fswebcam -v -r 1280x720 --no-banner video/testing/${now}.jpg`); // this will return even if the img is not saved.
execSync('aws s3  sync  ./video/  s3://backupforpi/video/');
