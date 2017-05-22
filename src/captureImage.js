// This code is there if we want to switch back to a manual flow, But, now "Motion" took control of that part.

// This will be the case with AWS S3. But you can add your own if you prefer Dropbox or any other soft. Or skip it completely if you put into the Dropbox/Gdrive folder directly.
// Ressources: http://docs.aws.amazon.com/cli/latest/userguide/using-s3-commands.html
const { execSync } = require('child_process');
const { addErrorCode } = require('./sqlightHandler');
const { diskUtility } = require('../config.json');
const fs = require('fs');
const path = require('path');

const waitms = async x => new Promise((resolve) => { setTimeout(resolve, x); });

// Current camera 12 img in 10 sec.
const captureImg = async (initialDate) => {
  let initDate = (initialDate === undefined) ? Date.now() : initialDate;
  const fullpath = `${diskUtility.saveImgPath}/${initDate}`;
  if (!fs.existsSync(fullpath)) {
    fs.mkdirSync(fullpath); // First occurence
  }
  const now = Date.now();
  if (now > initDate + 8000) { return true; }

  try {
    execSync(`sudo fswebcam -r 1280x720 -S 10 --no-banner video/${initialDate}/${now}.jpg`); // this will return even if the img is not saved.
    await addErrorCode('Img Capture', 'Capture', 'INFO');
  } catch (e) {
    if (e) { console.error('AMC', e); }
    await addErrorCode('Img Capture', 'Failed', 'WARNING');
  }
  await waitms(200);
  return captureImg(initDate);
};

module.exports.captureImg = captureImg;
