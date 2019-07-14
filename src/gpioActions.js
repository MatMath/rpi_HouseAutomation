// NOTE: use the -i instead of -g to use the physical pin instead of GPIO. see drogon.net/
const { log } = require('./bunyanLogs');
const { exec, execSync } = require('child_process');

const config = require('config');

const platform = process.platform; // Currently working building on a Mac so this works for me. You can always use a Env Var instead.
let movementDetected = 0;
let movementFront = 0;

const loadtimeSetup = (nbr, inOut) => {
  // Not on the Pi.
  if (platform !== 'linux') {
    log.warn(`Not loading pin ${nbr} ${inOut} (not on linux)`);
    return;
  }
  try {
    log.info({ fnct: 'loadtimeSetup' }, `Set Pin # ${nbr} at ${inOut}`);
    execSync(`gpio export ${nbr} ${inOut}`);
    // Initialise everything at 0. So there is no unknown state.
    if (inOut === 'out') {
      execSync(`gpio -g write ${nbr} 0`);
    }
  } catch (e) {
    log.error({ fnct: 'loadtimeSetup', error: e }, `ERROR Set Pin # ${nbr} at ${inOut}`);
  }
};

const waitMs = x => new Promise((resolve) => {
  setTimeout(resolve, x);
});

// Some pins need to be setup at load time for Out and In and the default value.
let gpioInit = () => {
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
};

let read1Pin = (nbr) => {
  // Not on the Pi.
  if (platform !== 'linux') return Promise.resolve(0);
  log.info({ fnct: 'read1Pin' }, `Read Pin ${nbr}`);
  return new Promise((resolve, reject) => {
    exec(`gpio -g read ${nbr}`, (error, stdout, stderr) => {
      if (error || stderr) {
        log.info({ fnct: 'read1Pin' }, `ERROR Reading Pin ${nbr}`);
        return reject();
      }
      return resolve(parseInt(stdout, 10));
    });
  });
};

let write1Pin = (nbr, value) => {
  // Not on the Pi.
  if (platform !== 'linux') return Promise.resolve(0);
  log.info({ fnct: 'write1Pin' }, `Write Pin ${nbr} at ${value}`);
  return new Promise((resolve, reject) => {
    exec(`gpio -g write ${nbr} ${value}`, (error, stdout, stderr) => {
      if (error || stderr) {
        log.info({ fnct: 'write1Pin', error }, `ERROR Write Pin ${nbr} at ${value}`);
        return reject();
      }
      return resolve(stdout);
    });
  });
};

let monitorFront = async(event) => {
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

let monitorDoorInterval = undefined;
let monitorDoor = (event) => {
  // TODO: Issue #4 Should be in a Event Detector instead but I cannot make pi-gpio or rpi-gpio work.
  if (monitorDoorInterval) return;
  monitorDoorInterval = setInterval(() => {
    read1Pin(config.doorMovementDetectionPin)
      .then((value) => {
        // Buffer so we dont call every second, and so the lignt Off dosent trigger the sensor.
        if (value === 1 && movementDetected < Date.now() + 2000) {
          // adding the front movement detection will block the false alarm (cheep sensor) since the person Absolutely Need to pass on the front door first.
          if (movementFront > Date.now()) {
            log.info({ fnct: 'monitorDoor' }, 'Door Movement detected');
            // Opent he light / Start Camera flow
            movementDetected = Date.now() + config.lightOpen_ms;
            event.emit('movement');
          } else {
            // False alarm at the door.  Count to monitor the State of the sensor/make adjustment.
            log.info({ fnct: 'monitorDoor' }, 'False Movement detected');
          }
        }
      })
      .catch((err) => {
        log.error({ fnct: 'monitorDoor', error: err }, 'Err in the Monitor Door');
      });
  }, 200);
};

if (process.env.MOCK_SENSOR) {
  let fakePins = new Map();
  console.log('MOCKING RPI');
  // We are disconnected from the RPI so let's use the API to mock the pins so we can manually trigger event.
  read1Pin = (pinNbr) => Promise.resolve(fakePins.get(pinNbr));

  write1Pin = (pinNbr, value) => {
    fakePins.set(pinNbr, value);
    console.log('write1Pin', fakePins);
    return Promise.resolve(0);
  }
}

module.exports = {
  gpioInit,
  read1Pin,
  write1Pin,
  monitorFront,
  monitorDoor,
};
