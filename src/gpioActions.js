// TODO: Handle initilaisation/reset Flow
const debug = require('debug')('gpio');
const EventEmitter = require('events');

const config = require('../config.json');
const gpio = require('rpi-gpio');
const { addErrorCode } = require('./sqlightHandler');

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const readCallback = (err, value) => {
  if (err) { return addErrorCode('Error in the PIN Read', err); }
  if (value === undefined) {
    console.log('You must run the script as SUDO.');
    addErrorCode('Code not as SUDO', value);
    return undefined;
  }
  console.log(value);
  return value;
};

function writeCallback(err) {
  if (err) { return addErrorCode('Error in the PIN Read', err); }
  console.log('Written to pin');
  return true;
}

const read1Pin = (nbr) => {
  gpio.setup(nbr, gpio.DIR_IN, gpio.read(nbr, readCallback));
};

const write1Pin = (nbr, value) => {
  gpio.setup(nbr, gpio.DIR_OUT, gpio.write(nbr, value, writeCallback));
};

const listenOnPinChange = (nbr) => {
  gpio.on('change', (channel, value) => {
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
  });
  gpio.setup(nbr, gpio.DIR_IN, gpio.EDGE_BOTH);
};

module.exports.read1Pin = read1Pin;
module.exports.write1Pin = write1Pin;
module.exports.listenOnPinChange = listenOnPinChange;
