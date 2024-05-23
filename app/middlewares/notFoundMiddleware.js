const notFoundMiddleware = (req, res) => {
  res.status(404).send({ error: 'Resource not found' });
};

module.exports = notFoundMiddleware;
