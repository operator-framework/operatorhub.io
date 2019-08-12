import path from 'path';

export const serverPort = process.env.PORT || 8080;
export const secureServerPort = process.env.SECUREPORT || 8443;

// TODO: Enable SSL
export const useSSL = false && !(process.env.USESSL === 'false');
export const keysDirectory = process.env.KEYDIR || '';

export const operatorsDirectory = process.env.OPERATORS_DIR || 'upstream-community-operators';
export const operatorIndexPath = path.join(process.cwd(), (process.env.INDEX_RELATIVE_PATH || '../server-build/cache/operators.json'));