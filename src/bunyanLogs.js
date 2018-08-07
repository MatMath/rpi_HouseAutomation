const bunyan = require('bunyan');
const { disk } = require('config');

// Rotate the logs daily and keep 10 days.
module.exports.log = bunyan.createLogger({
  name: 'events',
  streams: [{
    level: process.env.BUNYAN_LOG_LEVEL || 'WARN',
    type: 'rotating-file',
    path: disk.eventLogPath,
    period: '1d',
    count: 10,
  }],
});
