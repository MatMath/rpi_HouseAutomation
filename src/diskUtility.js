const debug = require('debug')('disk');
const disk = require('diskusage');
const fs = require('fs');
const path = require('path');

const { diskUtility } = require('../config.json');

const videoFolder = diskUtility.saveImgPath;
if (!fs.existsSync(videoFolder)) { fs.mkdirSync(videoFolder); }

const checkDiskUnix = () => {
  const info = disk.checkSync('/');
  return ({
    available: parseInt(info.available / 1024 / 1024, 10),
    total: parseInt(info.total / 1024 / 1024, 10),
    ratio: 100 - parseInt(info.available / info.total * 100, 10),
  });
};

// input 2017-04-23-21-53-18
const fileNameToTimestamp = (name) => {
  const dateSplit = name.split('-').map(item => parseInt(item, 10));
  dateSplit[1] -= 1; // substract 1 month. 0 to 11.
  return new Date(...dateSplit).getTime();
};

const cleanDisk = () => {
  // List and delete folder/data.
  // buffer = 1 day
  const buffer = 1 * 24 * 60 * 60 * 1000;
  fs.readdirSync(videoFolder).map((name) => {
    const filetmstamp = fileNameToTimestamp(name);
    if (filetmstamp < Date.now() - buffer) {
      fs.unlinkSync(path.join(videoFolder, name));
      debug(`Removing file ${name}`);
    }
    return '';
  });
};

const shouldWeCleanDisk = () => {
  // Here put your logic for the space management.
  if (checkDiskUnix().available < diskUtility.minMbSpace) {
    debug('Cleaning the Disk is trigger.');
    cleanDisk();
  }
};

module.exports.checkDiskUnix = checkDiskUnix;
module.exports.shouldWeCleanDisk = shouldWeCleanDisk;
module.exports.cleanDisk = cleanDisk;
