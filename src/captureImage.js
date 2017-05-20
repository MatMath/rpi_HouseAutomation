// This will be the case with AWS S3. But you can add your own if you prefer Dropbox or any other soft. Or skip it completely if you put into the Dropbox/Gdrive folder directly.
// Ressources: http://docs.aws.amazon.com/cli/latest/userguide/using-s3-commands.html
const { execSync } = require('child_process');
const { addErrorCode } = require('./sqlightHandler');

// Current camera 12 img in 10 sec.
const captureImg = async (initialDate) => {
  const initDate = (initialDate === undefined) ? Date.now() : initialDate;
  const now = Date.now();
  if (now > initDate + 8000) { return true; }

  try {
    execSync(`sudo fswebcam -r 1280x720 --no-banner video/${now}.jpg`); // this will return even if the img is not saved.
    await addErrorCode('Img Capture', 'Capture', 'INFO');
  } catch (e) {
    if (e) { console.error('AMC', e); }
    await addErrorCode('Img Capture', 'Failed', 'WARNING');
  }
  return captureImg(initDate);
};

module.exports.captureImg = captureImg;
