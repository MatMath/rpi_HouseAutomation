const { dBconnect, addFrontMovementLog, getFrontMovement, addDoorMovementLog, getDoorMovement, getDbHandle } = require('../src/mongodbHandler');

xdescribe('mongodbHandler', () => {
  before(function() {
    // Open DB;
    // Clear all logs if any.
  })
  describe('Front movement', () => {

    it('Add front movement', () => {
      //
    });

    it('Check front movement log', () => {
      //
    });
  });

  describe('Door movement', () => {

    it('Add door movement', () => {
      //
    });

    it('Check door movement log', () => {
      //
    });
  });
})
