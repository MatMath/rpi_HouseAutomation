// To use debug: export DEBUG=core,schedule,sql,img,gpio
const debug = require('debug')('core');
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const EventEmitter = require('events');
const auth = require('basic-auth');

const app = express();
app.use(helmet());

// Local Dependency
const { scheduler } = require('./scheduler');
const { openBlindSequence, closeBlindSequence } = require('./blindActions');
const { resizeAndValidateImg } = require('./openCVManager');
const { getAllErrLogs } = require('./sqlightHandler');
const { openLight } = require('./lightAction');
const { syncFolder } = require('./fileUpload');
const { monitorDoor, monitorFront, startProcessorFan, stopProcessorFan } = require('./gpioActions');
const { addErrorCode, getDoorMovement, frontMovement, getFrontMovement } = require('./sqlightHandler');
const config = require('../config.json');
const userControls = require('./userControls');
const { credentials } = require('../simpleAuth.json');
const { shouldWeCleanDisk } = require('./diskUtility');
const { captureImg } = require('./captureImage');

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

monitorDoor(myEmitter);
monitorFront(myEmitter);
setInterval(shouldWeCleanDisk, config.diskUtility.minDelayBetweenCheck * 60 * 1000); // Check disk space every X min.

// Handle the Blind Open/close flow
let blindStatus;
myEmitter.on('openBlind', () => {
  debug('Will Open the blind Now');
  addErrorCode('Open the Blind', 'NA', 'INFO');
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
  addErrorCode('Close the Blind', 'NA', 'INFO');
  if (blindStatus !== 'closed') {
    for (let i = 0; i < config.blindMotorControl.length; i++) {
      closeBlindSequence(config.blindMotorControl[i]);
    }
    blindStatus = 'closed';
  }
});

scheduler(`0 ${config.openMorningAt} * * *`, myEmitter, 'openBlind');
scheduler(`0 ${config.closeEveningAt} * * *`, myEmitter, 'closeBlind');


// On movement
myEmitter.on('movementFront', () => {
  // TODO: Trigger a front camera capture later.
  debug('Front Movement detected', new Date());
  captureImg(Date.now());
  frontMovement();
});

myEmitter.on('movement', async () => {
  // Open light
  debug('Door Movement detected', new Date());
  addErrorCode('Movement detected', 'NA', 'INFO');
  startProcessorFan(); // Processor will do OpenCV so it will need to cool down.
  setTimeout(stopProcessorFan, 30000);
  openLight();
  // Capture a image. --> ffmpg??
  // Save a image on disk
  // Upload the image Online immediately (in case Of Break in I want all image, later we can filter them.)
  // syncFolder(); // TODO: Make this smart so we Upload after a few frames to prevent the loss of data (break-in flow) and also after done processing everything.
  const imgPath = path.join(__dirname, '../sampleData/GreatDay.jpg');
  // Resize to appropriate level
  // Do img Validation on it
  // resizeAndValidateImg(imgPath); // This will run on each image that get in in paralle.
});

// Handle the Image Capture flow On Mac (testing) and (Linux real).
// FFMPG ? Or ??

// Save img/Stream on disk

// Load static Img or Stream and pipe to OpenCV.
// Problem I suspect: Capture of large image will be too fast for the Pi to actually save and process in real time? -> Need to do load Test.

// Save the "best" frame that the face get detected in (for future email or processing) and drop the rest?

// Upload all img on the server / Dropbox / G.Drive / S3.

const checkPermission = (req, res, next) => {
  const userInput = auth(req);
  if (!userInput || !credentials[userInput.name] || userInput.pass !== credentials[userInput.name]) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    res.end('Access denied');
  } else {
    next();
  }
};


// Clean all file older than X day for space. (32G locally).
app.get('/logs', (req, res) => getAllErrLogs().then(logs => res.json(logs)));
app.get('/logs/delete', (req, res) => getAllErrLogs(true).then(logs => res.json(logs)));
app.use('/actions', checkPermission, userControls);
app.get('/DoorMovement', (req, res) => {
  getDoorMovement().then(logs => res.json(logs.map(item => ({
    timestamp: item.evenementAt,
    humanReadable: new Date(item.evenementAt),
  }))));
});
app.get('/FrontMovement', (req, res) => {
  getFrontMovement().then(logs => res.json(logs.map(item => ({
    timestamp: item.evenementAt,
    humanReadable: new Date(item.evenementAt),
  }))));
});
app.get('/', (req, res) => {
  res.json(['/logs', '/logs/delete', '/actions', '/DoorMovement', 'FrontMovement']);
});

module.exports = app;
