// TODO: Handle initilaisation/reset Flow
const debug = require('debug')('gpio');
const exec = require('child_process').exec;

const config = require('../config.json');
const { addErrorCode } = require('./sqlightHandler');

let movementDetected = 0;

const loadtimeSetup = (nbr) => {
  exec(`'gpio export out' ${nbr}`, (error, stdout, stderr) => {
    if (error || stderr) { addErrorCode('WriteError', JSON.stringify({ nbr })); }
  });
};

// Some pins need to be setup at load time for Out and In and the default value.
loadtimeSetup(4);

const read1Pin = (nbr) => {
  debug(`Read Pin ${nbr}`);
  return new Promise((resolve, reject) => {
    exec(`gpio -g read ${nbr}`, (error, stdout, stderr) => {
      if (error || stderr) {
        addErrorCode('ReadError', JSON.stringify({ nbr }));
        return reject();
      }
      return resolve(parseInt(stdout, 10));
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

const listenToDoor = (event) => {
  // TODO: Should be in a Event Detector instead but I cannot make pi-gpio or rpi-gpio work.
  setInterval(() => {
    read1Pin(config.doorMovementDetectionPin)
    .then((value) => {
      if (value === 1) {
        // Opent he light / Start Camera flow
        debug('Door Movement detected');
        if (movementDetected < Date.now()) { // Buffer so we dont call every second.
          movementDetected = Date.now() + 30000;
          event.emit('movement');
        }
      }
    });
  }, 500);
};

const monitorMotorsPins = () => {
  setInterval(() => {
    for (let i = 0; i < config.blindMotorControl.length; i++) {
      validateMotorActions(config.blindMotorControl[i]); // TODO Improve this to not write every time but work with a Event Listener.
    }
  }, 1000);
};

// TODO: Put motor on a Promise.All with a timeout that close everything.
// Movement detector should be monitored better.


module.exports.read1Pin = read1Pin;
module.exports.write1Pin = write1Pin;
module.exports.listenToDoor = listenToDoor;
module.exports.monitorMotorsPins = monitorMotorsPins;
