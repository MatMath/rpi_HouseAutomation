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

const cleanDisk = () => {
  // List and delete folder/data.
  // buffer = 1 day
  const buffer = 1 * 24 * 60 * 60 * 1000;
  fs.readdirSync(videoFolder).map((name) => {
    if (parseInt(name, 10) < Date.now() - buffer) {
      const subFolder = path.join(videoFolder, name);
      debug(`removing all file in folder ${subFolder}`);
      fs.readdirSync(subFolder).map(file => fs.unlinkSync(path.join(subFolder, file)));
      debug(`Removing folder ${name}`);
      fs.rmdirSync(path.join(videoFolder, name));
      return name;
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
