const expect = require('expect.js');
const path = require('path');
const fs = require('fs');

const { validateAndResizeImg, copyXToY } = require('../src/openCVManager');

describe('Testing the Flow with OpenCV', function nameMe() {
  this.timeout(5000);
  const currentImg = path.join(__dirname, '../sampleData/GreatDay.jpg');
  const resizeDestination = path.join(__dirname, '../outputData/GreatDay.jpg');
  const synchDestination = path.join(__dirname, './sync/GreatDay.jpg');
  if (!fs.existsSync(path.join(__dirname, './sync/'))) {
    fs.mkdirSync(path.join(__dirname, './sync/'));
  }

  after(() => {
    fs.unlinkSync(resizeDestination);
    fs.unlinkSync(synchDestination);
  });

  it('test the image resize flow', (done) => {
    validateAndResizeImg(currentImg).then((info) => {
      expect(info.width).to.be(1000);
      done();
    });
  });

  it('Test the Img copy', (done) => {
    copyXToY(currentImg, synchDestination)
    .then(() => {
      console.log('FILE EXIST??', fs.existsSync(synchDestination));
      expect(fs.existsSync(synchDestination)).to.be(true);
      done();
    });
  });
});
