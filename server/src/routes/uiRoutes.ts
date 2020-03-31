import express, {Express, Request, Response} from 'express';
import path from 'path';

const testRouteFile = path.resolve(process.cwd(), '../test-route/akamai-sureroute-test-object.html');
const indexFile = path.resolve(process.cwd(), '../frontend/dist/index.html');
const distFolder = path.resolve(process.cwd(), '../frontend/dist/');

export default function(app: Express) {
  app.get('/', (request: Request, response: Response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.sendFile(indexFile);
  });

  // js, css, images etc.
  app.use('/static', express.static(distFolder));

  // Test Route
  app.get('/akamai-sureroute-test', (request, response) => {
    response.sendFile(testRouteFile);
  });
  app.get('/akamai-sureroute-test/*', (request, response) => {
    response.sendFile(testRouteFile);
  });

  // route any remaining paths to index for React to pick them up
  app.get('*', (request, response) => {
    response.sendFile(indexFile);
  });
};
