// This will be the case with AWS S3. But you can add your own if you prefer Dropbox or any other soft. Or skip it completely if you put into the Dropbox/Gdrive folder directly.
// Ressources: http://docs.aws.amazon.com/cli/latest/userguide/using-s3-commands.html
const { exec } = require('child_process');
const { addErrorCode } = require('./sqlightHandler');

const captureImg = async (initialDate) => {
  const initDate = (initialDate) ? initialDate : Date.now();
  const now = Date.now();
  if (now < initDate + 20000) { return; }
  await addErrorCode('Img Capture', 'Capture', 'INFO');
  try {
    await exec(`sudo fswebcam -r 1280x720 --no-banner video/${now}.jpg`);
  } catch (e) {
    if (e) { console.error('AMC', e); }
    addErrorCode('Capture Failed', e, 'INFO');
    console.log(e);
  }
  return captureImg(initialDate);
};

module.exports.captureImg = captureImg;
