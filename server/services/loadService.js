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

/**
 * Read out CSV file in nested version folder
 * @param {string} versionDirPath
 * @param {string} fileName
 */
const extractOperatorVersionData = (versionDirPath, fileName) => {
  const filePath = path.join(versionDirPath, fileName);

  let csvFile = null;
  let content = null;
  let fileType = 'Unknown';

  try {
    content = yaml.safeLoad(fs.readFileSync(filePath));
    fileType = getFileType(content);
  } catch (e) {
    console.error(`ERROR: Unable to parse ${fileName}`);
    console.error(e.message);
    return null;
  }

  if (fileType === 'CSV') {
    csvFile = content;
  } else if (fileType === 'Unknown') {
    console.warn(`Cannot identify file ${fileName}. Ignoring file`);
  }

  return csvFile;
};

/**
 * Extracts package and csv data from operator
 * @param {string} dirPath
 * @param {string} fileName
 */
const extractOperatorData = (dirPath, fileName) => {
  const operatorName = (dirPath.match(/[a-z-]+$/i) || ['unknown'])[0];
  const filePath = path.join(dirPath, fileName);
  const csvFiles = [];

  let packageFile = null;
  let content = null;
  let fileType = 'Unknown';

  // nested operator contains one folder per version
  // every version folder has exactly one CSV
  if (fs.statSync(filePath).isDirectory()) {
    const versionFolder = filePath;
    const versionFiles = fs.readdirSync(versionFolder);

    versionFiles.forEach(versionFile => {
      const csv = extractOperatorVersionData(versionFolder, versionFile);

      // there are other files than csv so ignore them!
      csv && csvFiles.push(csv);
    });

    if (csvFiles.length !== 1) {
      console.warn(`Operator ${operatorName} version ${filePath} contains no or multiple csvs! Ignoring it.`, csvFiles);
    }

    return {
      packageFile: null,
      csvFiles
    };
  }

  try {
    content = yaml.safeLoad(fs.readFileSync(filePath));
    fileType = getFileType(content);
  } catch (e) {
    console.error(`ERROR: Unable to parse ${fileName}`);
    console.error(e.message);
    return {
      packageFile: null,
      csvFiles
    };
  }

  if (fileType === 'PKG') {
    packageFile = content;
  } else if (fileType === 'CSV') {
    csvFiles.push(content);
  } else if (fileType === 'Unknown') {
    console.warn(`Cannot identify file ${fileName}. Ignoring file`);
  }

  return {
    packageFile,
    csvFiles
  };
};

/**
 * Loads all operators with packages and csv and normalize them
 * @param {*} callback
 */
const loadOperators = callback => {
  const packages = [];
  const operators = [];
  const operatorDirs = fs.readdirSync(operatorsFrameworkDirectory);

  operatorDirs.forEach(dir => {
    const dirPath = path.join(operatorsFrameworkDirectory, dir);

    if (fs.statSync(dirPath).isDirectory()) {
      // console.log(`Reading operator dir ${dir}`);

      const operatorFiles = fs.readdirSync(dirPath);

      let operatorPackage = null;
      let operatorCSVs = [];

      operatorFiles.forEach(file => {
        const operatorData = extractOperatorData(dirPath, file);
        const { packageFile, csvFiles } = operatorData;

        if (operatorPackage && packageFile) {
          console.error(`Operator ${dir} contains multiple package files!. Skipping it.`, operatorPackage, packageFile);
        } else if (packageFile) {
          operatorPackage = packageFile;
        }
        operatorCSVs = operatorCSVs.concat(csvFiles);
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
