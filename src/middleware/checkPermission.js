const auth = require('basic-auth');

const { credentials } = require('config');

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

module.exports = checkPermission;
