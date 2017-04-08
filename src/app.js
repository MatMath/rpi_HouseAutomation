// To use debug: export DEBUG=core,schedule
const debug = require('debug')('core');
const express = require('express');
const EventEmitter = require('events');

// Local Dependency
const { scheduler } = require('./scheduler.js');
const { openBlindSequence, closeBlindSequence } = require('./blindActions');

const app = express();
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const openAt = 7;
const closeAt = 18;
let blindStatus;
myEmitter.on('openBlind', () => {
  debug('Will Open the blind Now');
  if (blindStatus !== 'open') {
    openBlindSequence();
    blindStatus = 'open';
  }
});

myEmitter.on('closeBlind', () => {
  debug('Will Close the blind Now');
  if (blindStatus !== 'closed') {
    closeBlindSequence();
    blindStatus = 'closed';
  }
});



scheduler(`* ${openAt} * * *`, myEmitter, 'openBlind');
scheduler(`* ${closeAt} * * *`, myEmitter, 'closeBlind');

app.get('/', (req, res) => {
  res.json('Banana');
});

module.exports = app;
