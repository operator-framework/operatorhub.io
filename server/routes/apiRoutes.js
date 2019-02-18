const forceSSL = require('express-force-ssl');
const operatorsService = require('../services/operatorsService');
const updateService = require('../services/updateService');
const { useSSL } = require('../utils/constants');

const addCORSHeader = (request, response, next) => {
  const hasOrigin = request.headers.origin != null;

  response.set('Access-Control-Allow-Origin', hasOrigin ? request.headers.origin : '*');
  response.set('Access-Control-Allow-Credentials', !hasOrigin);
  response.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD, OPTIONS, PATCH');

  const requestHeaders = request.headers['access-control-request-headers'];

  if (requestHeaders != null) {
    response.set('Access-Control-Allow-Headers', requestHeaders);
  }

  next();
};

const forceToSSL = (request, response, next) => {
  if (useSSL) {
    forceSSL(request, response, next);
    return;
  }

  next();
};

module.exports = app => {
  app.get('/api/*', forceToSSL, addCORSHeader);
  app.post('/api/webhook', forceToSSL, addCORSHeader);

  app.get('/api/operators', operatorsService.fetchOperators);
  app.get('/api/operator', operatorsService.fetchOperator);
  app.post('/api/webhook', updateService.updateLocalOperators);
};
