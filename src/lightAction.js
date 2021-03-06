// Light are a LED strip on a 12V power supply.
// We plug the light to work then cut one wire (could be the 12V or the 120V) and with a relay OR a Transistor.
// Warning the Pi dosent have enough power to activate a Relay so if you use a relay you must have a transistor with external power supply that feed the relay.
// Other All in 1 possibility: https://www.sparkfun.com/products/10747

const config = require('config');
const { log } = require('./bunyanLogs');
const { write1Pin } = require('./gpioActions');
const { addDoorMovementLog } = require('./mongodbHandler');

const closeLight = () => {
  log.info({ fnct: 'closeLight' }, `Close light ${new Date()}`);
  write1Pin(config.lightOpenSSR, 0);
};

const openLight = () => {
  log.info({ fnct: 'openLight' }, `Open light ${new Date()}`);
  addDoorMovementLog();
  write1Pin(config.lightOpenSSR, 1);
  setTimeout(() => {
    closeLight();
  }, config.lightOpen_ms);
};

const activityLight = () => {
  // For some strange reason sometime the process Stop and that is even if forever is on top of it. :|
  // So having a blinking light might be fun to see if ti still run.
  const OnOffDelay = 2000;
  setInterval(() => write1Pin(config.aliveLight, 1), OnOffDelay);
  setTimeout(() => setInterval(() => write1Pin(config.aliveLight, 0), OnOffDelay), OnOffDelay / 2);
};

module.exports = {
  closeLight,
  openLight,
  activityLight,
};
