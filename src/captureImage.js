// This will be the case with AWS S3. But you can add your own if you prefer Dropbox or any other soft. Or skip it completely if you put into the Dropbox/Gdrive folder directly.
// Ressources: http://docs.aws.amazon.com/cli/latest/userguide/using-s3-commands.html
const { exec } = require('child_process');
const fs = require('fs');
const { addErrorCode } = require('./sqlightHandler');

const waitMs = x => new Promise((resolve) => { setTimeout(resolve, x); });

const existLoop = async (filePath) => {
  if (fs.existsSync(filePath)) { return true; }
  await waitMs(200);
  return existLoop(filePath);
};

const fileExistLoop = name => new Promise((resolve, reject) => {
  setTimeout(reject, 2000);
  const filePath = `${__dirname}/video/${name}.jpg`;
  fileExistLoop(filePath).then(resolve);
});

// Current camera 12 img in 10 sec.
const captureImg = async (initialDate) => {
  const initDate = (initialDate === undefined) ? Date.now() : initialDate;
  const now = Date.now();
  if (now > initDate + 8000) { return true; }

  try {
    await exec(`sudo fswebcam -r 1280x720 --no-banner video/${now}.jpg`); // this will return even if the img is not saved.
  } catch (e) {
    if (e) { console.error('AMC', e); }
    addErrorCode('Capture Failed', e, 'INFO');
    console.log(e);
  }
  try {
    await fileExistLoop(now);
    await addErrorCode('Img Capture', 'Capture', 'INFO');
  } catch (e) {
    await addErrorCode('Img Capture', 'Failed', 'WARNING');
  }
  return captureImg(initDate);
};

module.exports.captureImg = captureImg;
