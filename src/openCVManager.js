const debug = require('debug')('img');
const easyimage = require('easyimage');
const path = require('path');
const fs = require('fs');
const { addErrorCode } = require('./sqlightHandler');

const resizeImg = async (imgPath, name) => {
  debug('Resizing ', imgPath);
  const result = await easyimage.resize({ src: imgPath,
    dst: `./outputData/${name}`,
    width: 1000,
    height: 1000,
    x: 0,
    y: 0,
  });
  return result;
};

const validateAndResizeImg = async (imgPath) => {
  const imgInfo = await easyimage.info(imgPath);
  debug('Img Info BEFORE: ', imgInfo);
  const imgResize = await resizeImg(imgInfo.path, imgInfo.name);
  debug('img After resize:', imgResize);
  return imgResize;
};

const isThereAFaceOnThisImage = () => Promise.resolve(true);

const copyXToY = (from, dest) => new Promise((resolve, reject) => {
  const readStream = fs.createReadStream(from);
  readStream.once('error', reject);
  readStream.once('end', () => {
    debug('End so Add it to a DB to process later.');
    return true;
  });
  readStream.pipe(fs.createWriteStream(dest));
});

const resizeAndValidateImg = (original) => {
  const dest = path.join(__dirname, '../validImg/');
  validateAndResizeImg(original)
  .then(resizedImg => isThereAFaceOnThisImage(resizedImg))
  .then((result) => {
    if (result) {
      // copy img (original? or resized?) to a curated folder.
      return copyXToY(original, dest);
    }
    return true;
  })
  .catch((err) => {
    debug('Error in the Img Validation', err);
    addErrorCode('Error in the Image Validation', err);
  });
  // Do img Validation on it
};

module.exports.validateAndResizeImg = validateAndResizeImg;
module.exports.isThereAFaceOnThisImage = isThereAFaceOnThisImage;
module.exports.resizeAndValidateImg = resizeAndValidateImg;
