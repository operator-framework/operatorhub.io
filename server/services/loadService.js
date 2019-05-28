const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { operatorsDirectory } = require('../utils/constants');
const { normalizeOperators, normalizePackages } = require('../utils/operatorUtils');
const persistentStore = require('../store/persistentStore');

const operatorsFrameworkDirectory = `./data/community-operators/${operatorsDirectory}`;

const loadOperators = callback => {
  const csvFileList = [];
  const packages = [];

  /**
   * Scan nested folders until all CSVs are found
   * @param {string} dir
   */
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

  /**
   * Build operators array
   */
  const operators = _.reduce(
    csvFileList,
    (parsedOperators, { filePath, dir }) => {
      try {
        const operator = yaml.safeLoad(fs.readFileSync(filePath));
        const packageRootFolder = path.join(dir, '..');
        const packageFile = fs.readdirSync(packageRootFolder).filter(fn => fn.endsWith('.package.yaml'));

        // add package info into operator
        if (packageFile.length === 1) {
          const packageInfo = yaml.safeLoad(fs.readFileSync(path.join(packageRootFolder, packageFile[0])));
          if (!_.find(packages, { packageName: packageInfo.packageName })) {
            packages.push(packageInfo);
          }
          operator.packageInfo = packageInfo;
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

  const normalizedOperators = normalizeOperators(operators);
  // based on package default version find previous versions of operators
  // so we know which versions belongs to the package
  const normalizedPackages = normalizePackages(packages, normalizedOperators);

  persistentStore.setPackages(normalizedPackages, packagesErr => {
    if (packagesErr) {
      console.error(packagesErr.message);
    }
    persistentStore.setOperators(normalizedOperators, callback);
  });
};

const loadService = {
  loadOperators
};
module.exports = loadService;
