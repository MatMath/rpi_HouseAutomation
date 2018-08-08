// Base
const expect = require('expect.js');
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// Custom
const { scheduler } = require('../src/scheduler');

describe('initial test structure', () => {
  it('validate test structure', () => {
    expect(true).to.be(true);
  });
});


describe('test the Schedule Flow', function nameMe() {
  this.timeout(60000);
  it('Validate that an event get emitted at Now + 10ms', (done) => {
    myEmitter.on('testingFlow', () => {
      done();
    });
    scheduler(Date.now() + 10, myEmitter, 'testingFlow');
  });

  it.skip('Validate that an event get emitted at time X', (done) => {
    myEmitter.on('testingFlow2', () => {
      done();
    });
    const currentSecond = new Date().getSeconds() + 1; // Will fire every X second of every minutes, ex: 1:15, 2:15, 3:15 (until Node die).
    scheduler(`${currentSecond} * * * * *`, myEmitter, 'testingFlow2');
  });
});
