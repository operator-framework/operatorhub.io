/* eslint-disable prefer-destructuring */
const _ = require('lodash');
const persistentStore = require('../store/persistentStore');
const generateIdFromVersionedName = require('../utils/operatorUtils').generateIdFromVersionedName;

const createYaml = (packageName, operatorChannel, globalOperator) => {
  if (globalOperator) {
    return `apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: my-${packageName}
  namespace: operators
spec:
  channel: ${operatorChannel}
  name: ${packageName}
  source: operatorhubio-catalog
  sourceNamespace: olm`;
  }

  return `apiVersion: v1
kind: Namespace
metadata:
  name: my-${packageName}
---
apiVersion: operators.coreos.com/v1alpha2
kind: OperatorGroup
metadata:
  name: operatorgroup
  namespace: my-${packageName}
spec:
  targetNamespaces:
  - my-${packageName}
---
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: my-${packageName}
  namespace: my-${packageName}
spec:
  channel: ${operatorChannel}
  name: ${packageName}
  source: operatorhubio-catalog
  sourceNamespace: olm`;
};

const generateInstallYaml = (serverRequest, serverResponse) => {
  try {
    let operatorChannelName;
    let operatorName;

    const fields = serverRequest.url.split('/');
    if (fields.length === 4) {
      operatorChannelName = fields[2];
      operatorName = fields[3].replace('.yaml', '');
    } else if (fields.length === 3) {
      operatorName = fields[2].replace('.yaml', '');
    } else {
      serverResponse.status(500).send(`Invalid request, you must provide the <operator-name>.yaml`);
      return;
    }

    const operatorId = generateIdFromVersionedName(operatorName);

    // only latest operator can be installed using this service
    // therefore we always pick latest version for channel
    // no point in supporting old syntax

    persistentStore.getOperatorsById(operatorId, (operators, err) => {
      if (err) {
        serverResponse.status(500).send(err);
        return;
      } else if (operators.length === 0) {
        serverResponse.status(500).send(`No operator with id ${operatorName} found.`);
        return;
      }

      // use first operator as package name should be always same!
      const packageName = operators[0].packageName;
      let operator;

      if (!packageName) {
        serverResponse.status(500).send(`Operator ${operatorName} has invalid or no package information.`);
        return;
      }

      persistentStore.getPackage(packageName, (operatorPackage, packageError) => {
        if (err) {
          serverResponse.status(500).send(packageError);
          return;
        }
        if (!operatorChannelName) {
          const { defaultChannel } = operatorPackage;

          if (!defaultChannel) {
            serverResponse.status(500).send(`Operator ${operatorName} has invalid or no default channel information.`);
          }
          operatorChannelName = defaultChannel;
        }

        const channel = _.find(operatorPackage.channels, { name: operatorChannelName });

        if (!channel) {
          serverResponse.status(500).send(`Channel ${operatorChannelName} is invalid for operator ${operatorName}`);
          return;
        }

        const latestOperatorName = _.get(channel, 'currentCSV');
        // assign correct operator based on latest operator in channel
        operator = operators.find(op => op.name === latestOperatorName);

        serverResponse.send(createYaml(packageName, operatorChannelName, operator.globalOperator));
      });
    });
  } catch (e) {
    serverResponse.status(500).send(e.message);
  }
};

const yamlService = {
  generateInstallYaml
};

module.exports = yamlService;
