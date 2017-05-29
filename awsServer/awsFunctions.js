const { exec } = require('child_process');

const getList = dateParam => new Promise((resolve, reject) => {
  exec(`aws s3api list-objects --bucket backupforpi --prefix 'video/${dateParam}' --query 'Contents[].{Key: Key, Size: Size}' --max-items 50`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return reject(error);
    }
    if (stderr) {
      console.error(`exec error: ${stderr}`);
      return reject(stderr);
    }
    return resolve(JSON.parse(stdout));
  });
});

const deleteItem = key => new Promise((resolve, reject) => {
  exec(`aws s3api delete-object --bucket backupforpi --key ${key}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return reject(error);
    }
    if (stderr) {
      console.error(`exec error: ${stderr}`);
      return reject(stderr);
    }
    return resolve(JSON.parse(stdout));
  });
});

const moveItem = (key, dest) => new Promise((resolve, reject) => {
  exec(`FillMe`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return reject(error);
    }
    if (stderr) {
      console.error(`exec error: ${stderr}`);
      return reject(stderr);
    }
    return resolve(JSON.parse(stdout));
  });
});

module.exports.getList = getList;
module.exports.deleteItem = deleteItem;
module.exports.moveItem = moveItem;
