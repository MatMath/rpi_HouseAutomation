const gpioActions = require('./gpioActions'); // I need to import the whole module because of Sinon to stub it. :(
const { log } = require('./bunyanLogs');
const config = require('config');

const validateMotorActions = async (obj, id) => {
  // {"motorOpen":3, "motorClose":3, "openLimitSwitch": 5, "closeLimitSwitch": 5}
  try {
    const OLimit = await gpioActions.read1Pin(obj.openLimitSwitch);
    if (OLimit === 1) {
      log.info({ fnct: 'validateMotorActions' }, 'Limit reached, Stop Open motor');
      await gpioActions.write1Pin(obj.motorOpen, 0);
      clearInterval(id);
    } // Stop Motor
    const CLimit = await gpioActions.read1Pin(obj.closeLimitSwitch);
    if (CLimit === 1) {
      log.info({ fnct: 'validateMotorActions' }, 'Limit reached, Stop Closed motor');
      gpioActions.write1Pin(obj.motorClose, 0);
      clearInterval(id);
    } // stop motor
  } catch (e) {
    // Stop everything!!!
    log.error({ fnct: 'validateMotorActions', error: e }, 'MOTOR Control Error');
    gpioActions.write1Pin(obj.motorClose, 0);
    gpioActions.write1Pin(obj.motorOpen, 0);
    clearInterval(id);
  }
};


const monitorMotorsPins = () => {
  log.info({ fnct: 'monitorMotorsPins' }, 'monitoring the motors pins');
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
    }, 500);
  }
};

const openBlindSequence = (motorPinoutData) => {
  // Check status of the Blind
  gpioActions.read1Pin(motorPinoutData.openLimitSwitch)
  .then((value) => {
    if (value === true) { return false; } // Safety: Blind already Open
    return gpioActions.write1Pin(motorPinoutData.motorOpen, 1); // Blind not on the Open Limit switch, Open until it click.
  })
  .catch(err => log.error({ fnct: 'openBlindSequence', error: err }, 'Error in the PIN Read'));
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
  .catch(err => log.error({ fnct: 'closeBlindSequence', error: err }, 'Error in the PIN Read'));
  // At limit switch Turn off.
  monitorMotorsPins();
};

module.exports.openBlindSequence = openBlindSequence;
module.exports.closeBlindSequence = closeBlindSequence;
module.exports.validateMotorActions = validateMotorActions;
module.exports.monitorMotorsPins = monitorMotorsPins;
