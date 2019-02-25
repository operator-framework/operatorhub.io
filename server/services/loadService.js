const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { operatorsDirectory } = require('../utils/constants');
const { normalizeOperators } = require('../utils/operatorUtils');
const persistentStore = require('../store/persistentStore');

const operatorsFrameworkDirectory = `./data/community-operators/${operatorsDirectory}`;

const loadOperators = callback => {
  const csvFileList = [];

  const allCSVFilesSync = dir => {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        allCSVFilesSync(filePath);
      } else if (file.endsWith('.clusterserviceversion.yaml')) {
        csvFileList.push({ filePath, dir });
      }
    });
  };

  allCSVFilesSync(operatorsFrameworkDirectory);

  const operators = _.reduce(
    csvFileList,
    (parsedOperators, { filePath, dir }) => {
      try {
        const operator = yaml.safeLoad(fs.readFileSync(filePath));
        const packageFile = fs.readdirSync(dir).filter(fn => fn.endsWith('.package.yaml'));
        if (packageFile.length === 1) {
          operator.packageInfo = yaml.safeLoad(fs.readFileSync(path.join(dir, packageFile[0])));
        }
        parsedOperators.push(operator);
      } catch (e) {
        console.error(`ERROR: Unable to parse ${filePath}`);
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
