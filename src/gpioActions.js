// TODO: Handle initilaisation/reset Flow
const debug = require('debug')('gpio');
const exec = require('child_process').exec;
const EventEmitter = require('events');

const config = require('../config.json');
const { addErrorCode } = require('./sqlightHandler');

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

const validateMotorActions = (obj) => {
  // {"motorOpen":3, "motorClose":3, "openLimitSwitch": 5, "closeLimitSwitch": 5}
  read1Pin(obj.openLimitSwitch)
  .then((value) => {
    if (value === 1) {
      debug('Limit reached, Stop motor');
      write1Pin(obj.motorOpen, 0);
    } // Stop Motor
  })
  .then(() => read1Pin(obj.openLimitSwitch))
  .then((value) => {
    if (value === 1) {
      debug('Limit reached, Stop motor');
      write1Pin(obj.motorClose, 0);
    } // stop motor
  });
};

const listenToDoor = (nbr, event) => {
  read1Pin(nbr)
  .then((value) => {
    if (value === 1) {
      // Opent he light / Start Camera flow
      debug('Door Movement detected');
      event.emit('movement');  // TODO Not send every sec but have a buffer.
    }
  });
};

const monitorAllPins = (event) => {
  setInterval(() => {
    for (let i = 0; i < config.blindMotorControl.length; i++) {
      validateMotorActions(config.blindMotorControl[i]); // TODO Improve this to not write every time but work with a Event Listener.
      listenToDoor(config.doorMovementDetectionPin, event);
    }
  }, 1000);
};

// TODO: Put motor on a Promise.All with a timeout that close everything.
// Movement detector should be monitored better.


module.exports.read1Pin = read1Pin;
module.exports.write1Pin = write1Pin;
module.exports.monitorAllPins = monitorAllPins;
