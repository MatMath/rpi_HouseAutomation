// s3:    http://docs.aws.amazon.com/cli/latest/reference/s3/index.html
// s3api: http://docs.aws.amazon.com/cli/latest/reference/s3api/index.html
const { exec } = require('child_process');

const getList = (dateParam, subfolder) => new Promise((resolve, reject) => {
  exec(`aws s3api list-objects --bucket backupforpi --prefix '${subfolder}/${dateParam}' --query 'Contents[].{Key: Key, Size: Size}' --max-items 50`, (error, stdout, stderr) => {
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
  exec(`aws s3 mv s3://backupforpi/video/${key} s3://backupforpi/${dest}/${key}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return reject(error);
    }
    if (stderr) {
      console.error(`exec error: ${stderr}`);
      return reject(stderr);
    }
    return resolve(stdout);
  });
});

// Currently the folder is Public (read) because it is easier to filter it. Otherwse I have to ask the api to get me a signed URL.
const giveSignedUrl = (subfolder, key) => new Promise((resolve, reject) => {
  exec(`aws s3  presign  s3://backupforpi/${subfolder}/${key}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return reject(error);
    }
    if (stderr) {
      console.error(`exec error: ${stderr}`);
      return reject(stderr);
    }
    // Annoying, the stout give a tring with a /n at the end.
    return resolve(stdout.slice(0,stdout.lastIndexOf('\n')));
  });
});


module.exports.getList = getList;
module.exports.deleteItem = deleteItem;
module.exports.moveItem = moveItem;
module.exports.giveSignedUrl = giveSignedUrl;
