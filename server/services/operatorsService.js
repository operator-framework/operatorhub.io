const _ = require('lodash');
const persistentStore = require('../store/persistentStore');

const fetchOperator = (serverRequest, serverResponse) => {
  const operatorName = _.get(serverRequest, 'query.name', '');

  persistentStore.getOperator(operatorName, (operator, err) => {
    if (err) {
      serverResponse.status(500).send(err);
      return;
    }

    persistentStore.getPackage(operator.packageName, (operatorPackage, packageErr) => {
      if (packageErr) {
        serverResponse.status(500).send(packageErr);
        return;
      }
      // use the default channel if no channel was passed (backwards compatibility)
      const channelName = _.get(serverRequest, 'query.channel') || operatorPackage.defaultChannel;

      // Make sure the requested operator version is in the channel, if not find the one that it is in
      let channel = _.find(operatorPackage.channels, { name: channelName });
      if (!channel || !_.find(channel.versions, { name: operatorName })) {
        channel = _.find(operatorPackage.channels, opChannel => _.find(opChannel.versions, { name: operatorName }));
      }

      operator.channel = _.get(channel, 'name');
      operator.channels = operatorPackage.channels;

      serverResponse.send({ operator });
    });
  });
};

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
          packageOperator.channel = operatorPackage.defaultChannel;
          packageOperator.channels = operatorPackage.channels;
          operators.push(packageOperator);
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
