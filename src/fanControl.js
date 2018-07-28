// Note: The GPIO cannot run the fan, this open a Transistor (3.3v) and the transistor power the fan (5v).

const { processorFanPin } = require('config');
const { write1Pin } = require('./gpioActions');
const { log } = require('./bunyanLogs');
const fs = require('fs');

let processorFan = false; // On = True;

const startFan = () => { write1Pin(processorFanPin, 1); };
const stopFan = () => { write1Pin(processorFanPin, 0); };

const checkTemperature = () => {
  setInterval(() => {
    const temp = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp');
    log.info({ fnct: 'checkTemperature' }, `currentTemp = ${temp}`);
    if (processorFan === false && temp > 55000) {
      log.warn({ fnct: 'checkTemperature' }, `Starting Fan at: ${temp}`);
      startFan(); processorFan = true;
    }
    if (processorFan === true && temp < 45000) {
      log.warn({ fnct: 'checkTemperature' }, `Stopping Fan at: ${temp}`);
      stopFan(); processorFan = false;
    }
  }, 60000);
};

checkTemperature();
