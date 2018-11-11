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

const addFrontMovementLog = () => {
  const collection = dbName.collection('frontmovement');
  // Insert some documents
  return collection.insertOne({frontDetection: date.now()})
  .catch(error => log.error({ fnct: 'Mongo Front movement', error }, 'Err pushing to Mongo'));
}

const addDoorMovementLog = () => {
  const collection = dbName.collection('doormovement');
  // Insert some documents
  return collection.insertOne({doorDetection: date.now()})
  .catch(error => log.error({ fnct: 'Mongo Door movement', error }, 'Err pushing to Mongo'));
}

const getFrontMovement = () => {
  return ['tbd'];
}

const getDoorMovement = () => {
  return ['tbd'];
}

module.exports = {
  dBconnect,
  addFrontMovementLog,
  getFrontMovement,
  addDoorMovementLog,
  getDoorMovement,
  getDbHandle: () => dbName,
};
