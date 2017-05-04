// Light are a LED strip on a 12V power supply.
// We plug the light to work then cut one wire (could be the 12V or the 120V) and with a relay OR a Transistor.
// Warning the Pi dosent have enough power to activate a Relay so if you use a relay you must have a transistor with external power supply that feed the relay.
// Other All in 1 possibility: https://www.sparkfun.com/products/10747

const debug = require('debug')('light');
const { lightOpenSSR } = require('../config.json');
const { write1Pin } = require('./gpioActions');
const { doorMovement } = require('./sqlightHandler');

const closeLight = () => {
  debug(`Close light ${new Date()}`);
  write1Pin(lightOpenSSR, 0);
};

const openLight = () => {
  debug(`Open light ${new Date()}`);
  doorMovement();
  write1Pin(lightOpenSSR, 1);
  setTimeout(() => {
    closeLight();
  }, 30000);
};


module.exports.openLight = openLight;
