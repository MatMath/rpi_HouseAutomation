const { read1Pin, write1Pin } = require('./gpioActions');
const { addErrorCode } = require('./sqlightHandler');

const openBlindSequence = (motorPinoutData) => {
  // Check status of the Blind
  read1Pin(motorPinoutData.openLimitSwitch)
  .then((value) => {
    if (value === true) { return false; } // Safety: Blind already Open
    return write1Pin(motorPinoutData.motorOpen, 1); // Blind not on the Open Limit switch, Open until it click.
  })
  .catch(err => addErrorCode('Error in the PIN Read', err));
  // At the limit the switch will Turn off (check loop in GPIO).

  // Safety: In case of defect
  setTimeout(() => {
    write1Pin(motorPinoutData.motorOpen, 0); // Close the motor after X sec anyway.
  }, 30 * 1000);
};

const closeBlindSequence = (motorPinoutData) => {
  // Check status of the Blind
  read1Pin(motorPinoutData.openLimitSwitch)
  .then((value) => {
    if (value === true) { return false; } // Safety: Blind already Close
    return write1Pin(motorPinoutData.motorClose, 1); // Blind not on the Close Limit switch, Close until it click.
  })
  .catch(err => addErrorCode('Error in the PIN Read', err));
  // At limit switch Turn off.

  // Safety: In case of defect
  setTimeout(() => {
    write1Pin(motorPinoutData.motorClose, 0); // Close the motor after X sec anyway.
  }, 30 * 1000);
};

module.exports.openBlindSequence = openBlindSequence;
module.exports.closeBlindSequence = closeBlindSequence;
