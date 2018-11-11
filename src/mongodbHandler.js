// Need 2 DB, Door movement & Front movement.
// Generic libs
const { MongoClient, MongoError } = require('mongodb');

// Custom fnct
const { mongourl, mongoDBName } = require('config');
const { log } = require('./bunyanLogs');

let dbName;

const dBconnect = async () => {
  let client;
  try {
    client = await MongoClient.connect(mongourl, { useNewUrlParser: true });
    dbName = client.db(mongoDBName);
    return dbName;
  } catch (error) {
    log.error({ fnct: 'MongoClient', error }, 'Err Connecting to Mongo');
    return process.exit(1);
  }
};

const frontMovement() {

}

const doorMovement() {
  
}

module.exports = {
  dBconnect,
  getDbHandle: () => dbName,
};
