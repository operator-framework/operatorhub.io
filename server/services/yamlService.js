/* eslint-disable prefer-destructuring */
const _ = require('lodash');
const persistentStore = require('../store/persistentStore');

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
    let operatorPackageName;

    const fields = serverRequest.url.split('/');
    if (fields.length === 4) {
      operatorChannelName = fields[2];
      operatorPackageName = fields[3].replace('.yaml', '');
    } else if (fields.length === 3) {
      operatorPackageName = fields[2].replace('.yaml', '');
    } else {
      serverResponse.status(500).send(`Invalid request, you must provide the <operator-name>.yaml`);
      return;
    }

    // only latest operator can be installed using this service
    // therefore we always pick latest version for channel
    // no point in supporting old syntax

    persistentStore.getPackage(operatorPackageName, (operatorPackage, packageError) => {
      if (packageError) {
        serverResponse.status(500).send(packageError);
        return;
      }

      if (!operatorChannelName) {
        const { defaultChannel } = operatorPackage;

        if (!defaultChannel) {
          serverResponse
            .status(500)
            .send(`Operator package ${operatorPackageName} has invalid or no default channel information.`);
        }
        operatorChannelName = defaultChannel;
      }

      // find latest operator per channel if channel exists in package
      const channel = _.find(operatorPackage.channels, { name: operatorChannelName });

      if (!channel) {
        serverResponse
          .status(500)
          .send(`Channel ${operatorChannelName} does not exists in package ${operatorPackageName}.`);
        return;
      }

      const latestOperatorName = _.get(channel, 'currentCSV');

      // get operator data
      persistentStore.getOperatorByName(latestOperatorName, (operator, err) => {
        if (err) {
          serverResponse.status(500).send(err);
          return;
        } else if (!operator) {
          serverResponse.status(500).send(`No operator with id ${latestOperatorName} found.`);
          return;
        }

        serverResponse.send(createYaml(operatorPackageName, operatorChannelName, operator.globalOperator));
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
