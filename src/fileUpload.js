// This will be the case with AWS S3. But you can add your own if you prefer Dropbox or any other soft. Or skip it completely if you put into the Dropbox/Gdrive folder directly.
// Ressources: http://docs.aws.amazon.com/cli/latest/userguide/using-s3-commands.html
const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { diskUtility } = require('config');
const { log } = require('./bunyanLogs');

const tempImgPath = diskUtility.tempImgPath;
const videoFolder = diskUtility.saveImgPath;

const syncFolder = () => {
  exec('aws s3  sync  ./video/  s3://backupforpi/video/', (err, stdout, stderr) => {
    if (err || stderr) {
      log.error({ fnct: 'syncFolder', error: stderr, stdout }, 'AWS upload Failed');
    }
    log.info({ fnct: 'syncFolder', stdout }, 'AWS upload');
  });
};

const convertVideo = () => {
  // Why ?? Because motion cannot save to mp4 directly even if it use ffmpeg under.
  fs.readdirSync(tempImgPath).map((name) => {
    // Make list of all video in folder.
    const fullpath = path.join(tempImgPath, name);
    const outputPath = path.join(videoFolder, name.replace('.avi', '.mp4'));
    const stat = fs.statSync(fullpath);
    // Check Video Size if more than limit start conversion.
    if (stat.size > diskUtility.minVideoSize) {
      try {
        execSync(`avconv -i ${fullpath} ${outputPath}`);
        log.info({ fnct: 'convertVideo' }, `${name} File converted`);
      } catch (e) {
        log.error({ fnct: 'convertVideo', error: e }, `Error in File converted of ${name}`);
      }
    }
    // delete temp file
    fs.unlink(fullpath);
    return name;
  });
  // Convert the video to mp4 for Embeded html tag
  // delete avi video.
};

setInterval(convertVideo, 10000);

module.exports.syncFolder = syncFolder;
module.exports.convertVideo = convertVideo;
