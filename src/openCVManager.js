const easyimage = require('easyimage');

const resizeImg = async (imgPath, name) => {
  console.log('Resizing ', imgPath);
  const result = await easyimage.rescrop({ src: imgPath,
    dst: `./outputData/${name}`,
    width: 1000,
    height: 1000,
    x: 0,
    y: 0,
  });
  return result;
};

const validateImageSize = async (imgPath) => {
  const imgInfo = await easyimage.info(imgPath);
  console.log('Img Info BEFORE: ', imgInfo);
  const imgResize = await resizeImg(imgInfo.path, imgInfo.name);
  return imgResize;
};

module.exports.validateImageSize = validateImageSize;
