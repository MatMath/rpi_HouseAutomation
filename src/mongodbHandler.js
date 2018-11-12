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
  return collection.insertOne({timestamp: Date.now()})
  .catch(error => {
    log.error({ fnct: 'Mongo Front movement', error }, 'Err pushing to Mongo')
  });
}

const getFrontMovement = (date) => {
  const latest = date || Date.now() - 604800000; // 1 week
  // Date need to be in JS numeric format only.
  return new Promise(function(resolve, reject) {
    // for some reason Mongo send a first "resolve" before it is time.
    dbName.collection('frontmovement')
    .find({"timestamp": { $gte : latest }})
    .toArray((err, results) => {
      if (err) { return log.error({ fnct: 'Mongo GET Front movement', error }, 'Err Get of Mongo'); }
      resolve(results);
    });
  });

};

const addDoorMovementLog = () => {
  // Insert some documents
  return dbName.collection('doormovement')
  .insertOne({timestamp: Date.now()})
  .catch(error => log.error({ fnct: 'Mongo Door movement', error }, 'Err pushing to Mongo'));
}

const getDoorMovement = (date) => {
  const latest = date || Date.now() - 604800000; // 1 week
  return new Promise(function(resolve, reject) {
    // for some reason Mongo send a first "resolve" before it is time.
    dbName.collection('doormovement')
    .find({"timestamp": { $gte : latest }})
    .toArray((err, results) => {
      if (err) { return log.error({ fnct: 'Mongo GET Door movement', error }, 'Err Get of Mongo'); }
      resolve(results);
    });
  });
}

module.exports = {
  dBconnect,
  addFrontMovementLog,
  getFrontMovement,
  addDoorMovementLog,
  getDoorMovement,
  getDbHandle: () => dbName,
};
