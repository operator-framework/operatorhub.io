const fs = require('fs');
const express = require('express');
const http = require('http');
const https = require('https');
const selfSignedHttps = require('self-signed-https');
const _ = require('lodash');

const loadService = require('./services/loadService');
const persistentStore = require('./store/persistentStore');
const uiRoutes = require('./routes/uiRoutes');
const apiRoutes = require('./routes/apiRoutes');
const mockOperators = require('./__mock__/operators');

// const useSSL = !(process.env.USESSL === 'false');

const mockMode = false;
const keysDirectory = process.env.KEYDIR || '';

const app = express();

const setupApp = () => {
  app.set('port', process.env.PORT || 8080);
  // app.set('secureport', process.env.SECUREPORT || 8080);

  // routes
  uiRoutes(app);
  apiRoutes(app);

};

const setupSSL = () => {
  // TO be used when we have a valid signed certificate
  if (keysDirectory) {
    const secureOptions = {
      key: fs.readFileSync(`${keysDirectory}/operatorhub.key`),
      cert: fs.readFileSync(`${keysDirectory}/operatorhub.crt`)
    };
    return https.createServer(secureOptions, app);
  }
  return selfSignedHttps(app);
};

const serverStart = err => {
  if (err) {
    console.error(`Error loading operators: ${_.get(err, 'response.data.message', err)}`);
  }

  const server = http.createServer(app);
  server.listen(app.get('port'), '0.0.0.0', () => {
    console.log(`Express server listening on port ${app.get('port')}`);
  });

  // const secureServer = setupSSL();
  // secureServer.listen(app.get('secureport'), '0.0.0.0', () => {
  //   console.log(`Express secure server listening on port ${app.get('secureport')}`);
  // });
};

setupApp();

const populateDBMock = () => {
  persistentStore.setOperators(mockOperators);
  serverStart();
};

const populateDB = () => {
  loadService.loadOperators(serverStart);
};

const populate = mockMode ? populateDBMock : populateDB;

persistentStore.initialize(populate);
