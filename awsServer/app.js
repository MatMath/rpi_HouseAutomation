// This is a simple API so I can call it from a React Website and filter/control the data.

const express = require('express');
const helmet = require('helmet');
const awesomeLogger = require('express-bunyan-logger');
const auth = require('basic-auth');

const { credentials } = require('../simpleAuth.json');
const { getList, deleteItem } = require('./awsFunctions');

const app = express();
app.use(helmet());

// Way too simple for production but ok for Home fun
const checkPermission = (req, res, next) => {
  const userInput = auth(req);
  if (!userInput || !credentials[userInput.name] || userInput.pass !== credentials[userInput.name]) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    res.end('Access denied');
  } else {
    next();
  }
};

app.use(awesomeLogger({
  name: 'logger',
  streams: [{
    level: 'warn',
    stream: process.stdout,
  }],
}));

// app.use('/actions', checkPermission, userControls);
app.get('/listday/:dayid/', (req, res) => {
  const dayid = req.params.dayid;
  const daySplit = dayid.split('-');
  // we should have a strict format like "2017-05-01"
  if (daySplit.length === 3 && daySplit[0].length === 4 && daySplit[1].length === 2 && daySplit[2].length === 2) {
    getList(dayid)
    .then(data => res.json(data))
    .catch(err => res.status(400).send(err));
  } else {
    res.status(400).send('Need a Day format like 2017-05-01');
  }
});

app.get('/move/:key/:destination/', (req, res) => {
  const key = req.params.key;
  const dest = req.params.dest;
  if (key && dest) {
    // Possible destination: Delete, Car, Human, Richard (annoying neighbour always in the front)
    if (dest === 'delete') {
      deleteItem(key).then(info => res.json(info)).catch(err => res.status(400).send(err));
    } else if (dest === 'human') {
      moveItem(key, 'human').then(info => res.json(info)).catch(err => res.status(400).send(err));
    }
    res.status(200).send('');
  }
  res.status(400).send('Bad format');
});

app.get('/', (req, res) => {
  res.json(['/listday/2017-05-26', '/move/::fileID/::destination']);
});

app.set('port', process.env.API_PORT || 4242);
const server = app.listen(app.get('port'), () => {
  console.log(`Express server listening on port ${server.address().port}`);
});