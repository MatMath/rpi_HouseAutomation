// TODO: Handle initilaisation/reset Flow
const debug = require('debug')('gpio');
const exec = require('child_process').exec;
const EventEmitter = require('events');

const config = require('../config.json');
const { addErrorCode } = require('./sqlightHandler');

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const waitxSec = (x) => new Promise((resolve) => {
  console.log(`I will wait ${x} sec`);
  setTimeout(resolve, x * 1000);
});

const read1Pin = (nbr) => {
  debug(`Read Pin ${nbr}`);
  return new Promise((resolve, reject) => {
    exec(`gpio -g read ${nbr}`, (error, stdout, stderr) => {
      if (error || stderr) {
        addErrorCode('ReadError', JSON.stringify({ nbr }));
        return reject();
      }
      return resolve(stdout);
    });
  });
};

const write1Pin = (nbr, value) => {
  debug(`Write Pin ${nbr} at ${value}`);
  return new Promise((resolve, reject) => {
    exec(`gpio -g write ${nbr} ${value}`, (error, stdout, stderr) => {
      if (error || stderr) {
        addErrorCode('WriteError', JSON.stringify({ nbr, value }));
        return reject();
      }
      return resolve(stdout);
    });
  });
};

const listenOnPinChange = (nbr) => {
  const channel = '';
  console.log(`Channel ${channel} value is now  ${value}`);
  // TODO: Add logic here depending on what I have in the Config.
  if (channel === config.doorMovementDetectionPin) {
    // Opent he light/ Start Camera flow
    myEmitter.emit('movement');
  }
  // TODO: Make a loop here to valisate all cases.
  if (channel === config.blindMotorControl[0].openLimitSwitch) {
    debug('Limit reached, Stop motor');
  }
};

module.exports.read1Pin = read1Pin;
module.exports.write1Pin = write1Pin;
module.exports.listenOnPinChange = listenOnPinChange;
