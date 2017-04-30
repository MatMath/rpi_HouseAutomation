const { read1Pin ,write1Pin } = require('./gpioActions');
const { blindMotorControl } = require('../config.json');
const { addErrorCode } = require('./sqlightHandler');

const checkForErrorOrValue = (err, value) => {
  if (err) {
    addErrorCode('Error in the PIN Read', err);
    throw new Error('Bad Pin Readout');
  }
  if (value === undefined) {
    console.log('You must run the script as SUDO.');
    addErrorCode('Code not as SUDO', value);
    throw new Error('Not SUDO');
  }
};

const checkForError = (err) => {
  if (err) {
    addErrorCode('Error in the PIN Read', err);
    throw new Error('Bad Pin Readout');
  }
};

const openBlindSequence = () => {
  // Check status of the Blind
  const checkOpenLimitSwitch = (err, value) => {
    try { checkForErrorOrValue(err, value); } catch (e) { return false; }
    if (value === true) { return false; } // Safety: Blind already Open
    // Blind not on the Open Limit switch, Open until it click.
    if (value === false) { write1Pin(blindMotorControl[0].motorOpen, checkForError); }
    return value;
  };
  read1Pin(blindMotorControl[0].openLimitSwitch, checkOpenLimitSwitch);
  // If Open then power the motor to turn (right direction)
  // At limit switch Turn off.
  return true;
};

const closeBlindSequence = () => {
  return true;
};

module.exports.openBlindSequence = openBlindSequence;
module.exports.closeBlindSequence = closeBlindSequence;
