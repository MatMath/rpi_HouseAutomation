const express = require('express');

// own Dependency
const { openLight } = require('./lightAction');
const { openBlindSequence, closeBlindSequence } = require('./blindActions');
const config = require('../config.json');

const router = express.Router();

router.get('/openlight', (req, res) => { openLight(); res.json(true); });
router.get('/motor/open/:id', (req) => {
  const id = parseInt(req.params.id, 10);
  openBlindSequence(config.blindMotorControl[id]);
});
router.get('/motor/close/:id', (req) => {
  const id = parseInt(req.params.id, 10);
  closeBlindSequence(config.blindMotorControl[id]);
});
router.get('/', (req, res) => { res.json(['openlight', '/motor/open/:id', '/motor/close/:id']); });

module.exports = router;
