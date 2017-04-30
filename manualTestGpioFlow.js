const { openBlindSequence, closeBlindSequence } = require('./src/blindActions');
const { listenOnPinChange } = require('./src/gpioActions');
const config = require('./config.json');

const openBlindX = (motorIndex) => {
  openBlindSequence(config.blindMotorControl[motorIndex]);
};

const closeBlindX = (motorIndex) => {
  closeBlindSequence(config.blindMotorControl[motorIndex]);
};

const pinEventEmitter = () => {
  listenOnPinChange();
};

pinEventEmitter();
openBlindX(1);

module.exports.openBlindX = openBlindX;
module.exports.closeBlindX = closeBlindX;
