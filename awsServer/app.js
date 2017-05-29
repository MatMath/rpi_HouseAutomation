// This is a simple API so I can call it from a React Website and filter/control the data.

const express = require('express');
const helmet = require('helmet');
const awesomeLogger = require('express-bunyan-logger');
const auth = require('basic-auth');
const { exec } = require('child_process');
const { credentials } = require('../simpleAuth.json');

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

app.use('/actions', checkPermission, userControls);
app.get('/listDay/::dayid', (req, res) => {
  exec("aws s3api list-objects --bucket backupforpi --prefix 'video/2017-05-27' --query 'Contents[].{Key: Key, Size: Size}' --max-items 50").then((list) => {
    console.log('List received, send it back');
    res.json(list);
  });
});
