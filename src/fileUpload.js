// This will be the case with AWS S3. But you can add your own if you prefer Dropbox or any other soft. Or skip it completely if you put into the Dropbox/Gdrive folder directly.
// Ressources: http://docs.aws.amazon.com/cli/latest/userguide/using-s3-commands.html
const { exec } = require('child_process');
const { addErrorCode } = require('./sqlightHandler');

const syncFolder = () => {
  addErrorCode('AWS Upload', 'Upload', 'INFO');
  exec('aws s3  sync  ./video/  s3://backupforpi/video/', (err, stdout, stderr) => {
    if (err || stderr) { console.error(err, stderr); }
    addErrorCode('AWS Fail', stdout, 'INFO');
    console.log(stdout);
  });
};

module.exports.syncFolder = syncFolder;
