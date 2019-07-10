const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { operatorsDirectory } = require('../utils/constants');
const { normalizeOperators, normalizePackages } = require('../utils/operatorUtils');
const persistentStore = require('../store/persistentStore');

const operatorsFrameworkDirectory = `./data/community-operators/${operatorsDirectory}`;

/**
 * Derive file type from its content
 * @param {*} content
 * @returns {'CSV'|'CRD'|'PKG'|'Unknown'}
 */
const getFileType = content => {
  if (content.kind && content.apiVersion) {
    const apiName = content.apiVersion.substring(0, content.apiVersion.indexOf('/'));

    if (content.kind === 'ClusterServiceVersion' && apiName === 'operators.coreos.com') {
      return 'CSV';
    } else if (content.kind === 'CustomResourceDefinition' && apiName === 'apiextensions.k8s.io') {
      return 'CRD';
    }
    // package file is different with no kind and API
  } else if (content.packageName && content.channels) {
    return 'PKG';
  }

  return 'Unknown';
};

const loadOperators = callback => {
  const packages = [];
  const operators = [];

  const operatorDirs = fs.readdirSync(operatorsFrameworkDirectory);

  operatorDirs.forEach(dir => {
    const dirPath = path.join(operatorsFrameworkDirectory, dir);

    if (fs.statSync(dirPath).isDirectory()) {
      // console.log(`Reading operator dir ${dir}`);

      const operatorFiles = fs.readdirSync(dirPath);
      const operatorCSVs = [];

      let operatorPackage;

      operatorFiles.forEach(file => {
        const filePath = path.join(dirPath, file);

        // console.log(`Reading file ${file}`);

        let content = null;
        let fileType = 'Unknown';

        try {
          content = yaml.safeLoad(fs.readFileSync(filePath));
          fileType = getFileType(content);
        } catch (e) {
          console.error(`ERROR: Unable to parse ${file}`);
          console.error(e.message);
          return;
        }

        if (fileType === 'PKG') {
          operatorPackage = content;
        } else if (fileType === 'CSV') {
          operatorCSVs.push(content);
        } else if (fileType === 'Unknown') {
          console.warn(`Cannot identify file ${file}. Ignoring file`);
        }
      });

      if (operatorPackage) {
        // add package data to operator
        operatorCSVs.forEach(operator => {
          operator.packageInfo = operatorPackage;

          // add to operator list
          operators.push(operator);
        });

        if (operatorCSVs.length > 0) {
          packages.push(operatorPackage);
        } else {
          console.warn(`No valid CSVs found for operator ${dir}. Skipping this package.`);
        }
      } else {
        console.warn(`No operator package file found in operator ${dir}. Ignoring it.`);
      }
    }
  });

  normalizeOperators(operators).then(normalizedOperators => {
    const normalizedPackages = normalizePackages(packages, normalizedOperators);

    persistentStore.setPackages(normalizedPackages, packagesErr => {
      if (packagesErr) {
        console.error(packagesErr.message);
      }

      persistentStore.setOperators(normalizedOperators, callback);
    });
  });
};

const loadService = {
  loadOperators
};
module.exports = loadService;
