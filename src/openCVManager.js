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
  debug(`Copy From ${from} to ${dest}`);
  const readStream = fs.createReadStream(from);
  readStream.once('error', reject);
  readStream.once('end', () => {
    debug('End so Add it to a DB to process later.');
    return resolve(true);
  });
  readStream.pipe(fs.createWriteStream(dest));
});

const resizeAndValidateImg = (original) => {
  let dest;
  validateAndResizeImg(original)
  .then((resizedImg) => {
    dest = path.join(__dirname, '../validImg/', resizedImg.name);
    return isThereAFaceOnThisImage(resizedImg.path);
  })
  .then((result) => {
    if (result) {
      // copy img (original? or resized?) to a curated folder.
      return copyXToY(original, dest);
    }
    return true;
  })
  .catch((err) => {
    debug('Error in the Img Validation', err);
    addErrorCode('Error in the Image Validation', err, 'WARNING');
  });
  // Do img Validation on it
};

module.exports.validateAndResizeImg = validateAndResizeImg; // not needed but for testing flow.
module.exports.isThereAFaceOnThisImage = isThereAFaceOnThisImage; // not needed but for testing flow.
module.exports.resizeAndValidateImg = resizeAndValidateImg;
module.exports.copyXToY = copyXToY; // not needed but for testing flow.
