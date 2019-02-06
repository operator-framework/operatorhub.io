// const passport = require('passport');
// const http = require('http');
const operatorsService = require('../services/operatorsService');

module.exports = function(app) {
  app.get('/api/operators', operatorsService.fetchOperators);
  app.get('/api/operator', operatorsService.fetchOperator);
};
