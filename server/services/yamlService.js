/* eslint-disable prefer-destructuring */
const _ = require('lodash');
const persistentStore = require('../store/persistentStore');

const generateInstallYaml = (serverRequest, serverResponse) => {
  try {
    let operatorChannel;
    let operatorName;

    const fields = serverRequest.url.split('/');
    if (fields.length === 4) {
      operatorChannel = fields[2];
      operatorName = fields[3].replace('.yaml', '');
    } else if (fields.length === 3) {
      operatorName = fields[2].replace('.yaml', '');
    } else {
      serverResponse.status(500).send(`Invalid request, you must provide the <operator-name>.yaml`);
      return;
    }

    persistentStore.getOperator(operatorName, (operator, err) => {
      if (err) {
        serverResponse.status(500).send(err);
        return;
      }

      const { packageName, globalOperator } = operator;
      if (!packageName) {
        serverResponse.status(500).send(`Operator ${operatorName} has invalid or no package information.`);
        return;
      }

      persistentStore.getPackage(packageName, (operatorPackage, packageError) => {
        if (err) {
          serverResponse.status(500).send(packageError);
          return;
        }
        if (!operatorChannel) {
          const { defaultChannel } = operatorPackage;
          if (!defaultChannel) {
            serverResponse.status(500).send(`Operator ${operatorName} has invalid or no default channel information.`);
          }
          operatorChannel = defaultChannel;
        }

        if (!_.find(operatorPackage.channels, { name: operatorChannel })) {
          serverResponse.status(500).send(`Channel ${operatorChannel} is invalid for operator ${operatorName}`);
          return;
        }

        const installYaml = `apiVersion: v1
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

        const globalInstallYaml = `apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: my-${packageName}
  namespace: operators
spec:
  channel: ${operatorChannel}
  name: ${packageName}
  source: operatorhubio-catalog
  sourceNamespace: olm`;

        serverResponse.send(globalOperator ? globalInstallYaml : installYaml);
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
