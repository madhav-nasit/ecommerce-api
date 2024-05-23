const errorHandlerMiddleware = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode > 299 ? res.statusCode : !!err ? 400 : 500;
  res.status(statusCode).send({ message: err ?? 'Internal server error' });
};

module.exports = errorHandlerMiddleware;
