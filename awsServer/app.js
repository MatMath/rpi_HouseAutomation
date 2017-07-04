// This is a simple API so I can call it from a React Website and filter/control the data.

const express = require('express');
const helmet = require('helmet');
const awesomeLogger = require('express-bunyan-logger');
const auth = require('basic-auth');

const { credentials } = require('../simpleAuth.json');
const { getList, deleteItem, moveItem, giveSignedUrl } = require('./awsFunctions');

const possibleFolder = ['richard', 'car', 'people'];

const app = express();
app.use(helmet());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

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
app.get('/listday/:dayid/:subfolder', (req, res) => {
  const dayid = req.params.dayid;
  const daySplit = dayid.split('-');
  const subfolder = (possibleFolder.indexOf(req.params.subfolder.toLowerCase()) > -1) ? req.params.subfolder.toLowerCase() : 'video';
  // we should have a strict format like "2017-05-01"
  if (daySplit.length === 3 && daySplit[0].length === 4 && daySplit[1].length === 2 && daySplit[2].length === 2) {
    getList(dayid, subfolder)
    .then(data => res.json(data))
    .catch(err => res.status(400).json(err));
  } else {
    res.status(400).send('Need a Day format like 2017-05-01');
  }
});

app.get('/move/:key/:dest/', (req, res) => {
  const key = req.params.key;
  const dest = req.params.dest.toLowerCase();
  console.log('Hitting Move with ', key, dest);
  if (key && dest) {
    // Possible destination: Delete, Car, Human, Richard (annoying neighbour always in the front)
    if (dest === 'delete') {
      console.log('Deleting it');
      deleteItem(key).then(info => res.json(info)).catch(err => res.status(400).send(err));
    } else if (possibleFolder.indexOf(dest) > -1) {
      console.log('Moving it!');
      moveItem(key, dest).then(info => res.json(info)).catch(err => res.status(400).send(err));
    }
  } else {
    res.status(400).send('Bad format');
  }
});

// app.use('/actions', checkPermission, userControls);
app.get('/signed/:subfolder/:key', (req, res) => {
  const key = req.params.key;
  const subfolder = (possibleFolder.indexOf(req.params.subfolder.toLowerCase()) > -1) ? req.params.subfolder.toLowerCase() : 'video';
  // we should have a strict format like "2017-05-01"
  if (key && subfolder) {
    giveSignedUrl(subfolder, key).then(info => res.json(info)).catch(err => res.status(400).send(err));
  } else {
    res.status(400).send('Missing Param');
  }
});

app.get('/', (req, res) => {
  res.json(['/listday/2017-05-26/:subfolder', '/move/:key/:destination', '/signed/:subfolder/:key']);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {},
    title: 'error',
  });
});

app.set('port', process.env.API_PORT || 4242);
const server = app.listen(app.get('port'), () => {
  console.log(`Express server listening on port ${server.address().port}`);
});
