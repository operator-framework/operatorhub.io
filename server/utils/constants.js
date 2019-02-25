const serverPort = process.env.PORT || 8080;
const secureServerPort = process.env.SECUREPORT || 8443;

// TODO: Enable SSL
const useSSL = false && !(process.env.USESSL === 'false');
const keysDirectory = process.env.KEYDIR || '';

const mockMode = process.env.MOCK === 'true';
const comingSoon = process.env.COMINGSOON === 'true';

const operatorsDirectory =
  process.env.OPERATORS_DIR === undefined ? 'upstream-community-operators' : process.env.OPERATORS_DIR;

const constants = { serverPort, secureServerPort, useSSL, keysDirectory, operatorsDirectory, mockMode, comingSoon };

module.exports = constants;
