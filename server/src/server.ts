import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer, Server } from 'https';

import { readFileSync } from 'fs-extra';
import express, { Express } from 'express';
import selfSignedHttps from 'self-signed-https';
import compression from "compression";

import { serverPort, secureServerPort, useSSL, keysDirectory } from './utils/constants';
import uiRoutes from './routes/uiRoutes';
import apiRoutes from './routes/apiRoutes';
import { importDataAndPrepareForStartup } from './utils';
import { loadOperators } from './importer/legacy/loader';


const getHttpsServer = (app: Express): Server => {
  // TO be used when we have a valid signed certificate
  if (keysDirectory) {
    const secureOptions = {
      key: readFileSync(`${keysDirectory}/operatorhub.key`),
      cert: readFileSync(`${keysDirectory}/operatorhub.crt`)
    };
    return createHttpsServer(secureOptions, app);
  }
  return selfSignedHttps(app);
};

(async () => {

  await importDataAndPrepareForStartup();
  console.log('Ready to start server');

  const app = express();

  // gzip content - helps reduce size of REST endpoint
  // as static content is cached by CDN
  app.use(compression());

  app.set('port', serverPort);

  // routes
  apiRoutes(app);
  uiRoutes(app);


  createHttpServer(app).listen(app.get('port'), '0.0.0.0', () => {
    console.log(`Express server listening on port ${app.get('port')}`);
  });

  if (useSSL) {
    app.set('secureport', secureServerPort);

    getHttpsServer(app).listen(app.get('secureport'), '0.0.0.0', () => {
      console.log(`Express secure server listening on port ${app.get('secureport')}`);
    });
  }
})();
