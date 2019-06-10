const _ = require('lodash');
const persistentStore = require('../store/persistentStore');
const { generateIdFromVersionedName } = require('../utils/operatorUtils');

/**
 * @typedef {Object} ChannelData
 * @property {Channel} ChannelData.channel
 * @property {Channel[]} ChannelData.channels
 * @property {string} ChannelData.latestOperatorName
 */

/**
 * @typedef {Object} Channel
 * @prop {string} Channel.name
 * @prop {string} Channel.currentCSV
 * @prop {ChannelVersion[]} Channel.versions
 */

/**
 * @typedef {Object} ChannelVersion
 * @prop {string} ChannelVersion.name
 * @prop {string} Channel.version
 */

/**
 * @callback getOperatorChannelsCallback
 * @param {*} packageErr
 * @param {ChannelData=} channelData - operator channel data
 */

/**
 * @typedef {Object} OperatorPackage
 * @prop {string} OperatorPackage.name
 * @prop {string} OperatorPackage.defaultChannel
 * @prop {string} OperatorPackage.defaultOperatorId
 * @prop {Channel[]} OperatorPackage.channels
 */

/**
 * Find operator channel data
 *
 * if operator channel is not provided default is asumed
 * if operator name is provided, it is used to verify that version is available in the channel
 * @param {string} packageName
 * @param {string} [operatorChannel]
 * @param {string} [operatorName] - operator name with version
 * @param {getOperatorChannelsCallback} callback
 */
const getOperatorChannels = (packageName, operatorChannel, operatorName, callback) => {
  persistentStore.getPackage(packageName, (operatorPackage, packageErr) => {
    if (packageErr) {
      callback(packageErr);
      return;
    }

    // use the default channel if no channel was passed (backwards compatibility)
    const channelName = operatorChannel || operatorPackage.defaultChannel;

    let channel = _.find(operatorPackage.channels, { name: channelName });

    // check version only if operator name is provided
    if (operatorName) {
      // Make sure the requested operator version is in the channel, if not find the one that it is in
      if (!channel || !_.find(channel.versions, { name: operatorName })) {
        channel = _.find(operatorPackage.channels, opChannel => _.find(opChannel.versions, { name: operatorName }));
      }
    }

    callback(null, {
      channel: _.get(channel, 'name'),
      channels: operatorPackage.channels,
      latestOperatorName: _.get(channel, 'currentCSV')
    });
  });
};

/**
 * Find operator by full name with version number and channel
 * Channel is optional and default channel is asumed if omitted
 * @param {string} operatorName
 * @param {*} serverResponse
 * @param {string} [channelName]
 */
function findOperatorByName(operatorName, serverResponse, channelName) {
  persistentStore.getOperatorByName(operatorName, (operator, err) => {
    if (err) {
      serverResponse.status(500).send(err);
      return;
    }
    getOperatorChannels(operator.packageName, channelName, operator.name, (packageErr, channelData) => {
      if (packageErr) {
        serverResponse.status(500).send(packageErr);
        return;
      }
      operator.channel = channelData.channel;
      operator.channels = channelData.channels;
      serverResponse.send({ operator });
    });
  });
}

/**
 * Finds operator by its id (name without version)
 * @param {string} packageName
 * @param {*} serverResponse
 * @param {string} channelName
 * @param {string=} operatorName
 */
function findOperatorByPackageName(packageName, serverResponse, channelName, operatorName) {
  getOperatorChannels(packageName, channelName, operatorName, (packageErr, channelData) => {
    if (packageErr) {
      serverResponse.status(500).send(packageErr);
      return;
    }

    // if we have explicit name, we can find operator directly
    if (operatorName) {
      persistentStore.getOperatorsByPackageName(packageName, operatorName, (operator, err) => {
        if (err) {
          serverResponse.status(500).send(err);
          return;
        }

        operator.channel = channelData.channel;
        operator.channels = channelData.channels;
        serverResponse.send({ operator });
      });
    } else {
      persistentStore.getOperatorsByPackageName(packageName, channelData.latestOperatorName, (operator, err) => {
        if (err) {
          serverResponse.status(500).send(err);
          return;
        }

        operator.channel = channelData.channel;
        operator.channels = channelData.channels;
        serverResponse.send({ operator });
      });
    }
  });
}

/**
 * Fetch operator either using full or short name with or without the channel
 * @param {*} serverRequest
 * @param {*} serverResponse
 */
const fetchOperator = (serverRequest, serverResponse) => {
  const operatorName = _.get(serverRequest, 'query.name', '');
  const channelName = _.get(serverRequest, 'query.channel');
  const packageName = _.get(serverRequest, 'query.packageName');

  let operatorId = operatorName;

  // use method only if there is dot
  if (operatorName.indexOf('.') > -1) {
    operatorId = generateIdFromVersionedName(operatorName);
  }

  // use primarily package name as it is only unique identifier for operator, name may vary!
  if (packageName) {
    findOperatorByPackageName(
      packageName,
      serverResponse,
      channelName,
      operatorName === operatorId ? undefined : operatorName
    );

    // fallback to support old links with channel and name
  } else {
    findOperatorByName(operatorName, serverResponse, channelName);
  }
  // sadly website can't support old links with id only so no point in supporting them on BE
};

/**
 * Fetch all oeprators data with channel default channel and channel list
 * @param {*} serverRequest
 * @param {*} serverResponse
 */
const fetchOperators = (serverRequest, serverResponse) => {
  persistentStore.getPackages((packages, err) => {
    if (err) {
      serverResponse.status(500).send(err);
      return;
    }
    persistentStore.getOperators((allOperators, operatorsErr) => {
      if (operatorsErr) {
        serverResponse.status(500).send(operatorsErr);
        return;
      }

      const operators = [];
      _.forEach(packages, operatorPackage => {
        const packageOperator = _.find(allOperators, { name: operatorPackage.defaultOperatorId });

        if (packageOperator) {
          operators.push({
            id: packageOperator.id,
            name: packageOperator.name,
            displayName: packageOperator.displayName,
            imgUrl: packageOperator.thumbUrl,
            provider: packageOperator.provider,
            capabilityLevel: packageOperator.capabilityLevel,
            description: packageOperator.description,
            categories: packageOperator.categories,
            keywords: packageOperator.keywords,
            packageName: packageOperator.packageName
          });
        } else {
          console.error(`Unable to find default operator for package ${operatorPackage.name}`);
        }
      });

      serverResponse.send({ operators });
    });
  });
};

const operatorsService = {
  fetchOperators,
  fetchOperator
};
module.exports = operatorsService;
