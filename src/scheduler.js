const { log } = require('./bunyanLogs');
const schedule = require('node-schedule');

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    |
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)
// Execute a cron job every 5 Minutes = */5 * * * *
module.exports.scheduler = (dateToSet, EventObj, eventToEmit) =>
  schedule.scheduleJob(dateToSet, () => {
    // This also send Event when it get triggered so we can listen to them
    log.info({ fnct: 'scheduleJob' }, `Trigger 1 event ${eventToEmit} at: ${new Date()}`);
    EventObj.emit(eventToEmit);
  });
