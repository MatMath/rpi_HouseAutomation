const expect = require('expect.js');
const fs = require('fs');
const sinon = require('sinon');

const fanControl = require('../src/fanControl');
const gpioActions = require('../src/gpioActions');

describe('Fan control', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    fanControl.frequency = 500;
    gpioActions.write1Pin = sandbox.spy();
  });

  afterEach(() => {
    fanControl.running = false;
    fanControl.stopMonitoring();
    sandbox.restore();
  });

  describe('checkTemperature', () => {
    it('should start fan', () => {
      expect(fanControl.running).to.be(false);
      fs.readFileSync = sandbox.stub().returns(55000 + 10);

      fanControl.checkTemperature();
      expect(fanControl.running).to.equal(true);
      expect(gpioActions.write1Pin.getCall(0).args[0]).to.equal(22);
      expect(gpioActions.write1Pin.getCall(0).args[1]).to.equal(1);
    });

    it('should stop fan', () => {
      expect(fanControl.running).to.be(false);
      fs.readFileSync = sandbox.stub().returns(55000 + 10);
      fanControl.checkTemperature();
      expect(fanControl.running).to.equal(true);

      fs.readFileSync = sandbox.stub().returns(45000 - 10);
      fanControl.checkTemperature();
      expect(fanControl.running).to.equal(false);
      expect(gpioActions.write1Pin.getCall(0).args[0]).to.equal(22);
      expect(gpioActions.write1Pin.getCall(0).args[1]).to.equal(1);
    });
  });

  describe('startFan', () => {
    it('should start fan regardless of temperature', () => {
      expect(fanControl.running).to.be(false);
      fs.readFileSync = sandbox.stub().returns(45000 + 10);

      fanControl.startFan();
      expect(fanControl.running).to.equal(true);
      expect(gpioActions.write1Pin.getCall(0).args[0]).to.equal(22);
      expect(gpioActions.write1Pin.getCall(0).args[1]).to.equal(1);
    });
  });

  describe('startMonitoring', function describeStartMonitoring() {
    this.timeout(1200);

    beforeEach(() => {
      fs.readFileSync = sandbox.stub().returns(55000 + 10);
    });

    it('should startMonitoring fan', (done) => {
      expect(fanControl.running).to.be(false);
      expect(fanControl.interval).to.be(null);
      fanControl.startMonitoring();

      setTimeout(() => {
        expect(fanControl.temperature).to.be(55010);
        expect(fanControl.running).to.be(true);

        expect(gpioActions.write1Pin.getCall(0).args[0]).to.equal(22);
        expect(gpioActions.write1Pin.getCall(0).args[1]).to.equal(1);
        fanControl.stopMonitoring();

        done();
      }, 1000);
    });

    it('should not startMonitoring fan if it is already running', (done) => {
      expect(fanControl.interval).to.be(null);
      fanControl.startMonitoring();

      setTimeout(() => {
        // eslint-disable-next-line no-underscore-dangle
        expect(fanControl.interval._idleTimeout).to.equal(fanControl.frequency);
        fanControl.startMonitoring();

        expect(gpioActions.write1Pin.getCall(1)).to.equal(null);

        done();
      }, 1000);
    });
  });
});
