// The damn sqlite3 dosent work well with the test. Since it get created at script launch it get created in the other test at the same time as this test so one in Readonly and the ohter is the master.
// even if I change the EnvVar, all the script get evaluated once before we start.
// So the EndToEndTest cannot be run at the same time as the SqlightHandler test. Both work but separately.

const expect = require('expect.js');
const fs = require('fs');
const path = require('path');

const testingDB = 'testdb';

// Custom function to test:
const { addErrorCode, getAllErrLogs } = require('../src/sqlightHandler');

// Fake data to test with

describe('Testing the sqlite3 structure', () => {
  const fullDBPath = path.join(__dirname, '../src/db/', testingDB);
  console.log('process.env.testingDB: ', process.env.testingDB);

  before(() => {
    process.env.testingDB = testingDB; // This need to be before we load the script
    if (fs.existsSync(fullDBPath)) {
      fs.unlinkSync(fullDBPath);
    }
  });
  after(() => {
    // always pick up your trash before leaving ;)
    if (fs.existsSync(fullDBPath)) {
      fs.unlinkSync(fullDBPath);
    }
  });

  it('create the test DB', () => {
    // DB now not built before we request it.
    expect(fs.existsSync(fullDBPath)).to.be(false);
  });

  it('Test the Single entry or Error code', (done) => {
    const errStack = `Banana in a string${new Date()}`;
    addErrorCode('this is a message', errStack, 'WARNING')
    .then(getAllErrLogs)
    .then((data) => {
      expect(data[0].code).to.equal(errStack);
      done();
    });
  });

  it('Test many or Error code in sequence', (done) => {
    const arrOfError = [
      { msg: 'msg1', code: 'code1' },
      { msg: 'msg2', code: 'code2' },
      { msg: 'msg3', code: 'code3' },
      { msg: 'msg4', code: 'code4' },
      { msg: 'msg5', code: 'code5' },
      { msg: 'msg6', code: 'code6' },
    ];
    Promise.all([
      addErrorCode(arrOfError[0].msg, arrOfError[0].code, 'WARNING'),
      addErrorCode(arrOfError[1].msg, arrOfError[1].code, 'WARNING'),
      addErrorCode(arrOfError[2].msg, arrOfError[2].code, 'WARNING'),
      addErrorCode(arrOfError[3].msg, arrOfError[3].code, 'WARNING'),
      addErrorCode(arrOfError[4].msg, arrOfError[4].code, 'WARNING'),
      addErrorCode(arrOfError[5].msg, arrOfError[5].code, 'WARNING'),
    ])
    .then(getAllErrLogs)
    .then((data) => {
      expect(data.length).to.equal(arrOfError.length + 1); // +1 for previous test still there.
      done();
    });
  });
});
