// To use debug: export DEBUG=core,schedule,sql,img,gpio
const debug = require('debug')('core');
const express = require('express');
const path = require('path');
const EventEmitter = require('events');

// Local Dependency
const { scheduler } = require('./scheduler.js');
const { openBlindSequence, closeBlindSequence } = require('./blindActions');
const { resizeAndValidateImg } = require('./openCVManager');
const { getAllErrLogs } = require('./sqlightHandler');
const { openLight } = require('./lightAction');
const { syncFolder } = require('./fileUpload');
const config = require('../config.json');

const app = express();
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// Handle the Blind Open/close flow
let blindStatus;
myEmitter.on('openBlind', () => {
  debug('Will Open the blind Now');
  if (blindStatus !== 'open') {
    // Open All Blind
    for (let i = 0; i < config.blindMotorControl.length; i++) {
      openBlindSequence(config.blindMotorControl[i]);
    }
    blindStatus = 'open';
  }
});

myEmitter.on('closeBlind', () => {
  debug('Will Close the blind Now');
  if (blindStatus !== 'closed') {
    for (let i = 0; i < config.blindMotorControl.length; i++) {
      closeBlindSequence(config.blindMotorControl[i]);
    }
    blindStatus = 'closed';
  }
});

scheduler(`* ${config.openMorningAt} * * *`, myEmitter, 'openBlind');
scheduler(`* ${config.closeEveningAt} * * *`, myEmitter, 'closeBlind');


// On movement
myEmitter.on('movement', async () => {
  // Open light
  openLight();
  // Capture a image. --> ffmpg??
  // Save a image on disk
  // Upload the image Online immediately (in case Of Break in I want all image, later we can filter them.)
  syncFolder(); // TODO: Make this smart so we Upload after a few frames to prevent the loss of data (break-in flow) and also after done processing everything.
  const imgPath = path.join(__dirname, '../sampleData/GreatDay.jpg');
  // Resize to appropriate level
  // Do img Validation on it
  resizeAndValidateImg(imgPath); // This will run on each image that get in in paralle.
});

// Handle the Image Capture flow On Mac (testing) and (Linux real).
// FFMPG ? Or ??

// Save img/Stream on disk

// Load static Img or Stream and pipe to OpenCV.
// Problem I suspect: Capture of large image will be too fast for the Pi to actually save and process in real time? -> Need to do load Test.

// Save the "best" frame that the face get detected in (for future email or processing) and drop the rest?

// Upload all img on the server / Dropbox / G.Drive / S3.

// Clean all file older than X day for space. (32G locally).

app.get('/logs', (req, res) => getAllErrLogs().then(logs => res.json(logs)));
app.get('/logs/delete', (req, res) => getAllErrLogs(true).then(logs => res.json(logs)));
app.get('/light', () => { openLight(); });
app.get('/motor/open/:id', (req) => {
  const id = parseInt(req.params.id, 10);
  openBlindSequence(config.blindMotorControl[id]);
});
app.get('/motor/close/:id', (req) => {
  const id = parseInt(req.params.id, 10);
  closeBlindSequence(config.blindMotorControl[id]);
});
app.get('/', (req, res) => {
  res.json(['logs', '/logs/delete', '/light', '/motor/open/:id', '/motor/close/:id']);
});

module.exports = app;
