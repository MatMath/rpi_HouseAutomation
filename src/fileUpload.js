// This will be the case with AWS S3. But you can add your own if you prefer Dropbox or any other soft. Or skip it completely if you put into the Dropbox/Gdrive folder directly.
// Ressources: http://docs.aws.amazon.com/cli/latest/userguide/using-s3-commands.html
const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { disk } = require('config');
const { log } = require('./bunyanLogs');

const tempImgPath = disk.tempImgPath;
const videoFolder = disk.saveImgPath;

const fileUpload = {
  syncFolder: function syncFolder() {
    exec('aws s3  sync  ./video/  s3://backupforpi/video/', (err, stdout, stderr) => {
      if (err || stderr) {
        log.error({ fnct: 'syncFolder', error: stderr, stdout }, 'AWS upload Failed');
        return;
      }
      log.info({ fnct: 'syncFolder', stdout }, 'AWS upload');
    });
  },
  convertVideo: function convertVideo() {
    // Why ?? Because motion cannot save to mp4 directly even if it use ffmpeg under.
    fs.readdirSync(tempImgPath).map((name) => {
      // Make list of all video in folder.
      const fullpath = path.join(tempImgPath, name);
      const outputPath = path.join(videoFolder, name.replace('.avi', '.mp4'));
      const stat = fs.statSync(fullpath);
      // Check Video Size if more than limit start conversion.
      if (stat.size > disk.minVideoSize) {
        try {
          execSync(`avconv -i ${fullpath} ${outputPath}`);
          log.info({ fnct: 'convertVideo' }, `${name} File converted`);
        } catch (e) {
          log.error({ fnct: 'convertVideo', error: e }, `Error in File converted of ${name}`);
        }
      }
      // delete temp file
      try {
        fs.unlinkSync(fullpath);
      } catch (e) {
        log.error({ fnct: 'convertVideo', error: e }, `Unable to unlink  ${fullpath}`);
      }
      return name;
    });
    // Convert the video to mp4 for Embeded html tag
    // delete avi video.
  },
  monitorVideoDirectory: function monitorVideoDirectory() {
    if (this.interval) {
      return;
    }
    this.interval = setInterval(this.convertVideo, 10000);
  },
};

module.exports = fileUpload;
