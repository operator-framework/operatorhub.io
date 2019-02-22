const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { generateIdFromVersionedName, normalizeOperators } = require('../utils/operatorUtils');
const persistentStore = require('../store/persistentStore');

const operatorsFrameworkDirectory = './data/community-operators';

const loadOperators = callback => {
  const csvFileList = [];
  const packageFileList = [];

  const allCSVFilesSync = dir => {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        allCSVFilesSync(filePath);
      } else if (file.endsWith('.clusterserviceversion.yaml')) {
        csvFileList.push(filePath);
      }
    });
  };

  const allPackageFilesSync = dir => {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        allCSVFilesSync(filePath);
      } else if (file.endsWith('.package.yaml')) {
        packageFileList.push(filePath);
      }
    });
  };

  allCSVFilesSync(operatorsFrameworkDirectory);
  allPackageFilesSync(operatorsFrameworkDirectory);

  const channels = _.reduce(
    packageFileList,
    (channels, file) => {
      try {
        const packageData = yaml.safeLoad(fs.readFileSync(file));
        _.forEach(packageData.channels, channel => {
          const id = generateIdFromVersionedName(channel.currentCSV);
          if (!channels[id]) {
            channels[id] = [];
          }
          channels[id].push(channel.name);
        });
        return channels;
      } catch (e) {
        console.error(`ERROR: Unable to parse ${file}`);
        console.error(e.message);
      }
      return channels;
    },
    {}
  );

  const operators = _.reduce(
    csvFileList,
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
