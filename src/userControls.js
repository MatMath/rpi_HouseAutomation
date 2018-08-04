const express = require('express');

// own Dependency
const fanControl = require('./fanControl');
const { openLight } = require('./lightAction');
const { openBlindSequence, closeBlindSequence } = require('./blindActions');
const config = require('config');

const router = express.Router();

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
router.get('/', (req, res) => { res.json(['/openlight', '/startfan', '/motor/open/:id', '/motor/close/:id']); });

module.exports = router;
