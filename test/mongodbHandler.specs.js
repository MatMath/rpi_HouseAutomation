const expect = require('expect.js');

const { dBconnect, addFrontMovementLog, getFrontMovement, addDoorMovementLog, getDoorMovement } = require('../src/mongodbHandler');

describe.skip('mongodbHandler', () => {
  const timestamp = Date.now() - 1000;
  before((done) => {
    dBconnect().then(() => done());
  });

  it('Add front movement', async () => {
    await addFrontMovementLog();
    const list = await getFrontMovement(timestamp);
    expect(list.length).to.equal(1);
  });

  it('Add door movement', async () => {
    await addDoorMovementLog();
    const list = await getDoorMovement(timestamp);
    expect(list.length).to.equal(1);
  });
});
