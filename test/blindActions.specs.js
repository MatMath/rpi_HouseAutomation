// const fs = require('fs');
// const path = require('path');
const expect = require('expect.js');
const sinon = require('sinon');

const gpioActions = require('../src/gpioActions');

const config = require('../config.json');
const { validateMotorActions, monitorMotorsPins } = require('../src/blindActions');

describe('testing the blind sequence', function bob() {
  this.timeout(5000);
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should validateMotorActions', (done) => {
    let readOnePinCount = 0;
    let writeOnePinCount = 0;

    expect(gpioActions.write1Pin).to.not.be(undefined);
    expect(gpioActions.read1Pin).to.not.be(undefined);

    sandbox.stub(gpioActions, 'read1Pin').callsFake((pin) => {
      readOnePinCount++;
      console.log('Read PIN: ', pin);
      return Promise.resolve(1);
    }).toString();
    sandbox.stub(gpioActions, 'write1Pin').callsFake((pin, value) => {
      writeOnePinCount++;
      console.log('Write PIN: ', pin);
      expect(value).to.be(0);
      return Promise.resolve();
    }).toString();

    const idToDelete = setInterval(() => {
      console.log('Intervals: ', readOnePinCount, writeOnePinCount);
    }, 1000);

    validateMotorActions(config.blindMotorControl[0], idToDelete)
    .then(() => {
      expect(readOnePinCount).to.be(2);
      expect(writeOnePinCount).to.be(2);
      done();
    });
  });

  it('should iterate until limit reached and then resolved', (done) => {
    let readOnePinCount = 0;
    let writeOnePinCount = 0;
    const now = Date.now();

    expect(gpioActions.write1Pin).to.not.be(undefined);
    expect(gpioActions.read1Pin).to.not.be(undefined);
    sandbox.stub(gpioActions, 'read1Pin').callsFake((pin) => {
      readOnePinCount++;
      if (now + 1900 < Date.now()) {
        console.log('Read And resolve PIN: ', pin);
        return Promise.resolve(1);
      }
      console.log('Not resolving PIN: ', pin);
      return Promise.resolve(0);
    });
    sandbox.stub(gpioActions, 'write1Pin').callsFake((pin, value) => {
      writeOnePinCount++;
      console.log('Write And resolve PIN: ', pin);
      expect(value).to.be(0);
      return Promise.resolve();
    });

    monitorMotorsPins(); // Will call the validateMotorActions every 0.5 second. And will only resolve once after 2 sec. (close and open);
    setTimeout(() => {
      expect(readOnePinCount).to.be(config.blindMotorControl.length * 4 * 2); // 4 read/sec until 2 sec Target.
      // (if the Cancel interval failed then the test will failed since I wait 3.5 sec)
      expect(writeOnePinCount).to.be(config.blindMotorControl.length * 2); // 2 motors called 2 time each
      done();
    }, 3500);
  });
});
