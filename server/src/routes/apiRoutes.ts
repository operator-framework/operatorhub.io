import forceSSL from 'express-force-ssl';
import { Express, Request, Response, NextFunction } from 'express';

import { useSSL } from '../utils/constants';
import { fetchOperators, fetchOperator, generateInstallYaml } from '../services';
import { isArray } from 'util';

// TODO
// what is the purpose??
// do we really need this? Our requests are same origin!

/**
 * Add CORS headers to API response. Allow ANY origin
 * @param request 
 * @param response 
 * @param next 
 */
const addCORSHeader = (request: Request, response: Response, next: NextFunction) => {
    const hasOrigin = !!request.headers.origin;
    const originHeader = isArray(request.headers.origin) ? request.headers.origin[0] : request.headers.origin || '*';

    // based on https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
    if(hasOrigin){
        response.set('Access-Control-Allow-Origin', originHeader);
        response.set('Vary', 'Origin');
    }
    response.set('Access-Control-Allow-Credentials', (!hasOrigin).toString());
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    const requestHeaders = request.headers['access-control-request-headers'];

    if (requestHeaders != null) {
        response.set('Access-Control-Allow-Headers', isArray(requestHeaders) ? requestHeaders.join(', ') : requestHeaders);
    }

    next();
};

/**
 * Force use of SSL
 * @param request 
 * @param response 
 * @param next 
 */
const forceToSSL = (request: Request, response: Response, next: NextFunction) => {
    if (useSSL) {
        forceSSL(request, response, next);
        return;
    }

    next();
};


export default function (app: Express) {
    app.get('/api/*', forceToSSL, addCORSHeader);

    app.get('/api/operators', fetchOperators);
    app.get('/api/operator', fetchOperator);
    app.get('/install/*.yaml', generateInstallYaml);
};
