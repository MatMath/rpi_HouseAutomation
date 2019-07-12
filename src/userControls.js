const express = require('express');

// own Dependency
const fanControl = require('./fanControl');
const { openLight } = require('./lightAction');
const { openBlindSequence, closeBlindSequence } = require('./blindActions');
const { addFrontMovementLog, getFrontMovement, addDoorMovementLog, getDoorMovement } = require('./mongodbHandler');
const config = require('config');

const router = express.Router();

router.get('/doormovement', async (req, res) => {
  await addDoorMovementLog();
  res.json(await getDoorMovement());
}); // To test the DB Connection only.
router.get('/frontmovement', async (req, res) => {
  await addFrontMovementLog();
  res.json(await getFrontMovement());
}); // To test the DB Connection only.

router.get('/openlight', (req, res) => { openLight(); res.json(true); });
router.get('/startfan', (req, res) => { fanControl.startFan(); res.json({ temperature: fanControl.temperature }); });
router.get('/motor/open/:id', (req) => {
  const id = parseInt(req.params.id, 10);
  openBlindSequence(config.blindMotorControl[id]);
});
router.get('/motor/close/:id', (req) => {
  const id = parseInt(req.params.id, 10);
  closeBlindSequence(config.blindMotorControl[id]);
});
router.get('/', (req, res) => { res.json(['doormovement', 'frontmovement', '/openlight', '/startfan', '/motor/open/:id', '/motor/close/:id']); });

module.exports = router;
