const serverPort = process.env.PORT || 8080;
const secureServerPort = process.env.SECUREPORT || 8443;

// TODO: Enable SSL
const useSSL = false && !(process.env.USESSL === 'false');
const keysDirectory = process.env.KEYDIR || '';

const mockMode = false;

const constants = { serverPort, secureServerPort, useSSL, keysDirectory, mockMode };

module.exports = constants;
