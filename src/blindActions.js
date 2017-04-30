const { read1Pin, write1Pin } = require('./gpioActions');
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

const openBlindSequence = (motorPinoutData) => {
  // Check status of the Blind
  const checkOpenLimitSwitch = (err, value) => {
    try { checkForErrorOrValue(err, value); } catch (e) { return false; }
    if (value === true) { return false; } // Safety: Blind already Open
    // Blind not on the Open Limit switch, Open until it click.
    if (value === false) { write1Pin(motorPinoutData.motorOpen, checkForError); }
    return value;
  };
  read1Pin(motorPinoutData.openLimitSwitch, checkOpenLimitSwitch);
  // If Open then power the motor to turn (right direction)
  // At limit switch Turn off.
  return true;
};

const closeBlindSequence = (motorPinoutData) => {
  // Check status of the Blind
  const checkOpenLimitSwitch = (err, value) => {
    try { checkForErrorOrValue(err, value); } catch (e) { return false; }
    if (value === true) { return false; } // Safety: Blind already Open
    // Blind not on the Open Limit switch, Open until it click.
    if (value === false) { write1Pin(motorPinoutData.motorClose, checkForError); }
    return value;
  };
  read1Pin(motorPinoutData.closeLimitSwitch, checkOpenLimitSwitch);
  // If Open then power the motor to turn (right direction)
  // At limit switch Turn off.
  return true;
};

module.exports.openBlindSequence = openBlindSequence;
module.exports.closeBlindSequence = closeBlindSequence;
