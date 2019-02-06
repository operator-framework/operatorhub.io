// Load HTTP module
const express = require('express');
const http = require('http');

// const passport = require('passport');

const persistentStore = require('./store/persistentStore');
const routes = require('./routes/routes');

const router = express.Router();

const app = express();

const setupApp = function() {
  app.set('port', process.env.PORT || 9065);
  app.set('secureport', process.env.SECUREPORT || 443);

  // app.use(passport.initialize());
  // app.use(passport.session());
  // app.use(app.router);

  app.use(express.static('../frontend/dist'));

  // routes
  routes(app);
};

const serverStart = function(err) {
  if (!err) {
    // loadOperators(() => {
    server.listen(app.get('port'), () => {
      console.log(`Express server listening on port ${app.get('port')}`);
    });
    // });
  }
};

setupApp();

// Create HTTP server and listen on port 8000 for requests
const server = http.createServer(app);

persistentStore.initialize(serverStart);
