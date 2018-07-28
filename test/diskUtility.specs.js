const fs = require('fs');
const path = require('path');
const expect = require('expect.js');

const { cleanDisk } = require('../fileConverter/diskUtility');
const { diskUtility } = require('config');

const videoFolder = diskUtility.saveImgPath;
describe('testing the flow of disk Utility', () => {
  const listOfFiles = [
    '2017-05-23-21-53-18.avi',
    '2017-05-23-21-56-20.avi',
    '2017-05-23-21-57-28.avi',
    '2017-05-23-22-05-57.avi',
    '2017-05-23-22-10-33.avi',
    '2017-05-23-22-16-42.avi',
    '2017-05-23-22-21-23.avi'];
  const farfaraway = '2019-01-01-01-01-01.avi';
  before(() => {
    // Create the list of files to test with.
    listOfFiles.map(file => fs.writeFileSync(path.join(videoFolder, file), ' ')); // just to get a file created.
    fs.writeFileSync(path.join(videoFolder, farfaraway), ' ');
  });

  after(() => {
    if (fs.existsSync(path.join(videoFolder, farfaraway))) {
      fs.unlinkSync(path.join(videoFolder, farfaraway));
    }
  });

  it('Should delete ALL the filed except the last one', () => {
    cleanDisk();
    expect(fs.readdirSync(videoFolder).length).to.be(1);
  });
});
