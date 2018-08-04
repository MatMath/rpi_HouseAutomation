// Note: The GPIO cannot run the fan, this open a Transistor (3.3v) and the transistor power the fan (5v).

const fs = require('fs');
const { hardware, processorFanPin } = require('config');

const gpioActions = require('./gpioActions');
const { log } = require('./bunyanLogs');

const fan = {
  start: () => {
    gpioActions.write1Pin(processorFanPin, 1);
  },
  stop: () => {
    gpioActions.write1Pin(processorFanPin, 0);
  },
};

module.exports = {
  running: false,
  temperature: null,
  checkTemperature: function checkTemperature() {
    try {
      const temp = fs.readFileSync(hardware.cpu.temperature.filepath);
      this.temperature = temp;
      log.info({ fnct: 'checkTemperature' }, `currentTemp = ${temp}`);
      if (this.running === false && temp > hardware.cpu.temperature.threshold.warm) {
        log.warn({ fnct: 'checkTemperature' }, `Starting Fan at: ${temp}`);
        fan.start();
        this.running = true;
      } else if (this.running === true && temp < hardware.cpu.temperature.threshold.cold) {
        log.warn({ fnct: 'checkTemperature' }, `Stopping Fan at: ${temp}`);
        fan.stop();
        this.running = false;
      }
    } catch (err) {
      log.warn(err);
    }
  },
  frequency: 60000,
  startFan: function startFan() {
    fan.start();
    this.running = true;
  },
  startMonitoring: function startMonitoring() {
    if (this.interval) {
      return;
    }
    this.interval = setInterval(() => {
      this.checkTemperature();
    }, this.frequency);
  },
  stopMonitoring: function stopMonitoring() {
    if (!this.interval) {
      return;
    }
    clearInterval(this.interval);

    this.interval = null;
  },
  interval: null,
};
