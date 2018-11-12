const expect = require('expect.js');

const { dBconnect, addFrontMovementLog, getFrontMovement, addDoorMovementLog, getDoorMovement, getDbHandle } = require('../src/mongodbHandler');

xdescribe('mongodbHandler', () => {
  const timestamp = Date.now() - 1000;
  before(function(done) {
    dBconnect().then((tmp) => {
      done();
    });
    // Open DB;
    // Clear all logs if any.
  })

  it('Add front movement', async function() {
    await addFrontMovementLog()
    const list = await getFrontMovement(timestamp);
    expect(list.length).to.equal(1);
  });

  xdescribe('Door movement', () => {

    it('Add door movement', () => {
      //
    });

    it('Check door movement log', () => {
      //
    });
  });
})
