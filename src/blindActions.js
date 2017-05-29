const gpioActions = require('./gpioActions'); // I need to import the whole module because of Sinon to stub it. :(
const { addErrorCode } = require('./sqlightHandler');
const config = require('../config.json');

const validateMotorActions = async (obj, id) => {
  console.log('validateMotorActions', obj);
  // {"motorOpen":3, "motorClose":3, "openLimitSwitch": 5, "closeLimitSwitch": 5}
  try {
    const OLimit = await gpioActions.read1Pin(obj.openLimitSwitch);
    if (OLimit === 1) {
      console.log('Limit reached, Stop Open motor');
      await gpioActions.write1Pin(obj.motorOpen, 0);
      clearInterval(id);
    } // Stop Motor
    const CLimit = await gpioActions.read1Pin(obj.closeLimitSwitch);
    if (CLimit === 1) {
      console.log('Limit reached, Stop Closed motor');
      gpioActions.write1Pin(obj.motorClose, 0);
      clearInterval(id);
    } // stop motor
  } catch (e) {
    // Stop everything!!!
    console.error('MOTOR Control Error', e);
    gpioActions.write1Pin(obj.motorClose, 0);
    gpioActions.write1Pin(obj.motorOpen, 0);
    clearInterval(id);
  }
};


const monitorMotorsPins = () => {
  const starting = Date.now();
  for (let i = 0; i < config.blindMotorControl.length; i++) {
    const intervalId = setInterval(() => {
      validateMotorActions(config.blindMotorControl[i], intervalId); // TODO Improve this to not write every time but work with a Event Listener.
      if (starting + 20000 < Date.now()) {
        // Safety in case the blind sensor do not respond.
        const obj = config.blindMotorControl[i];
        clearInterval(intervalId);
        gpioActions.write1Pin(obj.motorOpen, 0)
        .then(() => gpioActions.write1Pin(obj.motorClose, 0));
      }
    }, 1000);
  }
};

const openBlindSequence = (motorPinoutData) => {
  // Check status of the Blind
  gpioActions.read1Pin(motorPinoutData.openLimitSwitch)
  .then((value) => {
    if (value === true) { return false; } // Safety: Blind already Open
    return gpioActions.write1Pin(motorPinoutData.motorOpen, 1); // Blind not on the Open Limit switch, Open until it click.
  })
  .catch(err => addErrorCode('Error in the PIN Read', err, 'ERROR'));
  // At the limit the switch will Turn off
  monitorMotorsPins();
};

const closeBlindSequence = (motorPinoutData) => {
  // Check status of the Blind
  gpioActions.read1Pin(motorPinoutData.openLimitSwitch)
  .then((value) => {
    if (value === true) { return false; } // Safety: Blind already Close
    return gpioActions.write1Pin(motorPinoutData.motorClose, 1); // Blind not on the Close Limit switch, Close until it click.
  })
  .catch(err => addErrorCode('Error in the PIN Read', err, 'ERROR'));
  // At limit switch Turn off.
  monitorMotorsPins();
};

module.exports.openBlindSequence = openBlindSequence;
module.exports.closeBlindSequence = closeBlindSequence;
module.exports.validateMotorActions = validateMotorActions;
