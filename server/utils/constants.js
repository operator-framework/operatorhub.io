const serverPort = process.env.PORT || 8080;
const secureServerPort = process.env.SECUREPORT || 8443;

const ignoreComingSoon = process.env.COMINGSOON === 'false';

// THIS MUST BE IN SYNC WITH comingSoon/index.html value
const releaseDate = new Date('Feb 28, 2019 9:00:00 PST');

// TODO: Enable SSL
const useSSL = false && !(process.env.USESSL === 'false');
const keysDirectory = process.env.KEYDIR || '';

const mockMode = process.env.MOCK === 'true';

const operatorsDirectory =
  process.env.OPERATORS_DIR === undefined ? 'upstream-community-operators' : process.env.OPERATORS_DIR;

const constants = {
  serverPort,
  secureServerPort,
  useSSL,
  keysDirectory,
  operatorsDirectory,
  mockMode,
  releaseDate,
  ignoreComingSoon
};

module.exports = constants;
