const debug = require('debug')('sql');
const fs = require('fs');

const base = './src/db/';
const dbName = 'localinfo';
const sqlite3 = require('sqlite3').verbose();
// Notes: sqlite3 is just Junk, this is why:
// - Opening and closing the DB will break it if 2 open at the same time (same Node instance).
// - Serialised dosent even do sequence of event. I was planning to use db.close(), but that close the MAIN Db and not just the Cashed version.
// When it fail it dosent propagate error (sometime crash and dosent tell).

const getFullPath = () => {
  // using EnvVar to be able to bypass the DB Creation at the start.
  const envDB = process.env.testingDB;  // For testing only
  return (envDB) ? base + envDB : base + dbName;
};

const generateDBAndTable = fullPath => new Promise((resolve, reject) => {
  debug('Generating a clean DB at: ', fullPath);
    // If we dont use the cashed version it crash with a Socket IO error.
  const cashDb = new sqlite3.cached.Database(fullPath);
    // cashDb.on('error', (err)=>{ debug('ERROR in cashDb ', err); }); Cannot be use since it will be active no matter where it fail. (dosent have closure)
  cashDb.serialize(() => {
    cashDb.run('CREATE TABLE errorlogs (message TEXT, code TEXT)', [], (e) => {
      debug('resolving the LAST function called', e);
      if (e) { reject(e); }
      resolve();
    });
  }, (err) => {
    debug('THIS NEVER GET REACHED ???');
    if (err) { reject(err); }
  });
});

const buildOrGetDb = () => {
  const fullPath = getFullPath();
  if (!fs.existsSync(fullPath)) {
    debug('DB DOESNT EXIST, add tables');
    generateDBAndTable(fullPath);
  }
  return new sqlite3.cached.Database(fullPath);
};

const addErrorCode = (message, code) => {
  let codeString = code;
  if (typeof code !== 'string') { codeString = JSON.stringify(code); }
  const tablename = 'errorlogs';
  return new Promise((resolve, reject) => {
    const cashDb = buildOrGetDb();
    cashDb.serialize(() => {
      const stmt = cashDb.prepare(`INSERT INTO ${tablename} (message, code) VALUES (?, ?)`);
      stmt.run(message, codeString);
      stmt.finalize();

      cashDb.each(`SELECT rowid AS id, message, code FROM ${tablename}`, [], (e) => {
        // debug('SELECT:', row, e);
        if (e) { reject(e); }
        resolve();
      });
    });
  });
};

const getAllErrLogs = (deleteTag) => {
  const tablename = 'errorlogs';
  return new Promise((resolve, reject) => {
    const cashDb = buildOrGetDb();
    cashDb.serialize(() => {
      if (deleteTag === true) {
        cashDb.run(`DELETE FROM ${tablename}`);
      }
      cashDb.all(`SELECT rowid AS id, message, code FROM ${tablename}`, [], (e, row) => {
        if (e) { reject(e); }
        return resolve(row);
      });
    });
  });
};

module.exports.generateDBAndTable = generateDBAndTable;

module.exports.addErrorCode = addErrorCode;
module.exports.getAllErrLogs = getAllErrLogs;
