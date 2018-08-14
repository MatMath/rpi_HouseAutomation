const { log } = require('./bunyanLogs');
const fs = require('fs');

const base = './src/db/';
if (!fs.existsSync(base)) { fs.mkdir(base); }
const dbName = 'localinfo';
const sqlite3 = require('sqlite3').verbose();
// Notes: sqlite3 is far from the best, but at least to handle some logs and track suff it is ok(ish).

const getFullPath = () => {
  // using EnvVar to be able to bypass the DB Creation at the start.
  const envDB = process.env.testingDB;  // For testing only
  return (envDB) ? base + envDB : base + dbName;
};

const generateDBAndTable = fullPath => new Promise((resolve, reject) => {
  log.info({ fnct: 'generateDBAndTable' }, `Generating a clean DB at: ${fullPath}`);
    // If we dont use the cashed version it crash with a Socket IO error.
  const cashDb = new sqlite3.cached.Database(fullPath);
    // cashDb.on('error', (err)=>{ debug('ERROR in cashDb ', err); }); Cannot be use since it will be active no matter where it fail. (dosent have closure)
  cashDb.serialize(() => {
    cashDb.run('CREATE TABLE doormovement (evenementAt DATE)');
    cashDb.run('CREATE TABLE frontmovement (evenementAt DATE)');
    cashDb.run('CREATE TABLE errorlogs (message TEXT, code TEXT, severity TEXT, event_date DATE)', [], (e) => {
      if (e) { reject(e); }
      resolve();
    });
  }, (err) => {
    if (err) { reject(err); }
  });
});

const buildOrGetDb = () => {
  const fullPath = getFullPath();
  if (!fs.existsSync(fullPath)) {
    log.info({ fnct: 'buildOrGetDb' }, 'DB DOESNT EXIST, add tables');
    generateDBAndTable(fullPath);
  }
  return new sqlite3.cached.Database(fullPath);
};

const doorMovement = () => {
  const cashDb = buildOrGetDb();
  cashDb.run('INSERT INTO doormovement ( evenementAt ) VALUES (?)', [Date.now()]);
};

const getDoorMovement = () => {
  const cashDb = buildOrGetDb();
  return new Promise((resolve, reject) => {
    cashDb.all('SELECT * FROM doormovement', [], (e, row) => {
      if (e) { reject(e); }
      return resolve(row);
    });
  });
};

const frontMovement = () => {
  const cashDb = buildOrGetDb();
  cashDb.run('INSERT INTO frontmovement ( evenementAt ) VALUES (?)', [Date.now()]);
};

const getFrontMovement = () => {
  const cashDb = buildOrGetDb();
  return new Promise((resolve, reject) => {
    cashDb.all('SELECT * FROM frontmovement', [], (e, row) => {
      if (e) { reject(e); }
      return resolve(row);
    });
  });
};

module.exports.generateDBAndTable = generateDBAndTable;

module.exports = {
  doorMovement,
  getDoorMovement,
  frontMovement,
  getFrontMovement,
};
