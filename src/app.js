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

myEmitter.on('openBlind', () => {
  debug('Will Open the blind Now');
  openBlindSequence();
});

myEmitter.on('closeBlind', () => {
  debug('Will Cose the blind Now');
  closeBlindSequence();
});

scheduler(`* ${openAt} * * *`, myEmitter, 'openBlind');
scheduler(`* ${closeAt} * * *`, myEmitter, 'closeBlind');

app.get('/', (req, res) => {
  res.json('Banana');
});

module.exports = app;
