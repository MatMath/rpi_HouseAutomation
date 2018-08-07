// // This is to test the flow of the camera since I seems to have problem with the USB capture (saturated, not taking img and all other)
//
// const { execSync } = require('child_process');
// const { disk } = require('config');
// const fs = require('fs');
//
// const now = Date.now();
// const testDir = `${disk.saveImgPath}/testing`;
// if (!fs.existsSync(testDir)) { fs.mkdirSync(testDir); }
// execSync(`sudo fswebcam -v -r 1280x720 -S 20 --no-banner video/testing/${now}.jpg`); // This skip 20 img (stability) then save 1 so lose 1.5 sec :/
//
// execSync('aws s3  sync  ./video/  s3://backupforpi/video/');
