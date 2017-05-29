// NOTE: use the -i instead of -g to use the physical pin instead of GPIO. see drogon.net/

const debug = require('debug')('gpio');
const { exec, execSync } = require('child_process');

const config = require('../config.json');
const { addErrorCode } = require('./sqlightHandler');

const platform = process.platform; // Currently working building on a Mac so this works for me. You can always use a Env Var instead.
let movementDetected = 0;
let movementFront = 0;

const loadtimeSetup = (nbr, inOut) => {
  if (platform !== 'linux') { return; } // Not on the Pi.
  try {
    console.log(`Set Pin # ${nbr} at ${inOut}`);
    execSync(`gpio export ${nbr} ${inOut}`);
    if (inOut === 'out') { execSync(`gpio -g write ${nbr} 0`); } // Initialise everything at 0. So there is no unknown state.
  } catch (e) {
    addErrorCode('WriteError', JSON.stringify({ nbr }), 'WARNING');
  }
};

// Some pins need to be setup at load time for Out and In and the default value.
function init() {
  loadtimeSetup(config.doorMovementDetectionPin, 'in');
  loadtimeSetup(config.frontMovementDetectionPin, 'in');
  loadtimeSetup(config.aliveLight, 'out');
  loadtimeSetup(config.lightOpenSSR, 'out');
  loadtimeSetup(config.processorFanPin, 'out');
  for (let i = 0; i < config.blindMotorControl.length; i++) {
    const blind = config.blindMotorControl[i];
    loadtimeSetup(blind.motorOpen, 'out');
    loadtimeSetup(blind.motorClose, 'out');
    loadtimeSetup(blind.openLimitSwitch, 'in');
    loadtimeSetup(blind.closeLimitSwitch, 'in');
  }
}
init();

const read1Pin = (nbr) => {
  if (platform !== 'linux') { return Promise.resolve(0); } // Not on the Pi.
  debug(`Read Pin ${nbr}`);
  return new Promise((resolve, reject) => {
    exec(`gpio -g read ${nbr}`, (error, stdout, stderr) => {
      if (error || stderr) {
        addErrorCode('ReadError', JSON.stringify({ nbr }), 'WARNING');
        return reject();
      }
      return resolve(parseInt(stdout, 10));
    });
  });
};

const write1Pin = (nbr, value) => {
  if (platform !== 'linux') { return Promise.resolve(0); } // Not on the Pi.
  debug(`Write Pin ${nbr} at ${value}`);
  return new Promise((resolve, reject) => {
    exec(`gpio -g write ${nbr} ${value}`, (error, stdout, stderr) => {
      if (error || stderr) {
        addErrorCode('WriteError', JSON.stringify({ nbr, value }), 'WARNING');
        return reject();
      }
      return resolve(stdout);
    });
  });
};

const waitMs = x => new Promise((resolve) => { setTimeout(resolve, x); });

const monitorFront = async (event) => {
  // currently it does nothing.
  try {
    await waitMs(200);
    const value = await read1Pin(config.frontMovementDetectionPin);
    if (value === 1) {
      // Do a test to see if it is a car passing/False alarm
      await waitMs(config.falseAlarmBuffer);
      const valid = await read1Pin(config.frontMovementDetectionPin);
      if (valid === 1 && movementFront < Date.now()) { // Buffer so we dont call every second.
        movementFront = Date.now() + config.frontMovementBuffer;
        event.emit('movementFront');
      }
    }
  } catch (e) {
    console.error('Error in the Monitor Front', e);
  }
  return monitorFront(event);
};

const monitorDoor = (event) => {
  // TODO: Issue #4 Should be in a Event Detector instead but I cannot make pi-gpio or rpi-gpio work.
  setInterval(() => {
    read1Pin(config.doorMovementDetectionPin)
    .then((value) => {
      // Buffer so we dont call every second, and so the lignt Off dosent trigger the sensor.
      if (value === 1 && movementDetected < Date.now() + 2000) {
        // adding the front movement detection will block the false alarm (cheep sensor) since the person Absolutely Need to pass on the front door first.
        if (movementFront > Date.now()) {
          debug('Door Movement detected');
          // Opent he light / Start Camera flow
          movementDetected = Date.now() + config.lightOpen_ms;
          event.emit('movement');
        } else {
          // False alarm at the door.  Count to monitor the State of the sensor/make adjustment.
          debug('False Movement detected');
        }
      }
    })
    .catch((err) => {
      console.error('Err in the Monitor Door', err);
    });
  }, 200);
};

module.exports.read1Pin = read1Pin;
module.exports.write1Pin = write1Pin;
module.exports.monitorFront = monitorFront;
module.exports.monitorDoor = monitorDoor;
