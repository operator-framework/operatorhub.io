const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { normalizeOperators } = require('../utils/operatorUtils');
const persistentStore = require('../store/persistentStore');

const operatorsFrameworkDirectory = './data/community-operators';

const loadOperators = callback => {
  const fileList = [];

  const allFilesSync = dir => {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        allFilesSync(filePath);
      } else if (file.endsWith('.clusterserviceversion.yaml')) {
        fileList.push(filePath);
      }
    });
  };

  allFilesSync(operatorsFrameworkDirectory);
  const operators = _.reduce(
    fileList,
    (parsedOperators, file) => {
      try {
        parsedOperators.push(yaml.safeLoad(fs.readFileSync(file)));
      } catch (e) {
        console.error(`ERROR: Unable to parse ${file}`);
        console.error(e.message);
      }
      return parsedOperators;
    },
    []
  );
  persistentStore.setOperators(normalizeOperators(operators), callback);
};

const loadService = {
  loadOperators
};
module.exports = loadService;
