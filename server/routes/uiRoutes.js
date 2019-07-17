const express = require('express');
const path = require('path');

const testRouteFile = path.resolve(__dirname, '../../test-route/akamai-sureroute-test-object.html');
const indexFile = path.resolve(__dirname, '../../frontend/dist/index.html');
const distFolder = path.resolve(__dirname, '../../frontend/dist/');

module.exports = app => {
  app.get('/', (request, response) => {
    response.sendFile(indexFile);
  });

  app.use('/static', express.static(distFolder));

  // Test Route
  app.get('/akamai-sureroute-test', (request, response) => {
    response.sendFile(testRouteFile);
  });
  app.get('/akamai-sureroute-test/*', (request, response) => {
    response.sendFile(testRouteFile);
  });

  app.get('*', (request, response) => {
    response.sendFile(indexFile);
  });
};
