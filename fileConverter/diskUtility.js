const fs = require('fs');
const { log } = require('../src/bunyanLogs');
const path = require('path');

const { diskUtility } = require('../config.json');

const videoFolder = diskUtility.saveImgPath;
if (!fs.existsSync(videoFolder)) { fs.mkdirSync(videoFolder); }

// input 2017-04-23-21-53-18
const fileNameToTimestamp = (name) => {
  const dateSplit = name.split('-').map(item => parseInt(item, 10));
  dateSplit[1] -= 1; // substract 1 month. 0 to 11.
  return new Date(...dateSplit).getTime();
};

const cleanDisk = () => {
  log.info({ fnct: 'cleanDisk' }, 'Starting the clean disk structure');
  // List and delete folder/data.
  // buffer = 1 day
  const buffer = 1 * 24 * 60 * 60 * 1000;
  fs.readdirSync(videoFolder).map((name) => {
    const filetmstamp = fileNameToTimestamp(name);
    if (filetmstamp < Date.now() - buffer) {
      log.info({ fnct: 'cleanDisk' }, `Removing file ${name}`);
      fs.unlinkSync(path.join(videoFolder, name));
    }
    return '';
  });
};
setInterval(cleanDisk, diskUtility.minDelayBetweenCheck * 60 * 1000); // Clean disk space every X min. Better for AWS crawl.

module.exports.cleanDisk = cleanDisk;
