process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', (err) => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });


// Express error handler must have 4 args
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  res.status(err.status || 500);

  req.log.fields.stack = err.stack;
  if (process.env.NODE_ENV === 'production' && err.status >= 500) {
    res.json({
      message: 'Internal Server Error',
      status: 500,
    });
    return;
  }

  res.json({
    message: err.message,
    error: {},
    title: 'Error',
  });
};
