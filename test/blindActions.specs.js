// const fs = require('fs');
// const path = require('path');
const expect = require('expect.js');
const gpioActions = require('../src/gpioActions');
const sinon = require('sinon');

const config = require('../config.json');
const { validateMotorActions } = require('../src/blindActions');

describe.only('testing the blind sequence', () => {
  // const sandbox = sinon.sandbox.create();

  afterEach(() => {
    // sandbox.restore();
  });

  it('should validateMotorActions', (done) => {
    let readOnePinCount = 0;
    let writeOnePinCount = 0;

    expect(gpioActions.write1Pin).to.not.be(undefined);
    expect(gpioActions.read1Pin).to.not.be(undefined);

    sinon.stub(gpioActions, 'read1Pin').callsFake((pin) => {
      readOnePinCount++;
      console.log('Read PIN: ', pin);
      return Promise.resolve(1);
    }).toString();
    sinon.stub(gpioActions, 'write1Pin').callsFake((pin, value) => {
      writeOnePinCount++;
      console.log('Write PIN: ', pin);
      expect(value).to.be(0);
      return Promise.resolve();
    }).toString();

    const idToDelete = setInterval(() => {
      console.log('Intervals: ', readOnePinCount, writeOnePinCount);
    }, 1000);

    validateMotorActions(config.blindMotorControl[0], idToDelete)
    .then((data) => {
      expect(readOnePinCount).to.be(2);
      expect(writeOnePinCount).to.be(2);
      done();
    });
  });
});
