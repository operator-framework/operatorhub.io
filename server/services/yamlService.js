const _ = require('lodash');
const persistentStore = require('../store/persistentStore');

const quayCatalogSourceImage = 'quay.io/operatorframework/upstream-community-operators:latest';

const generateInstallYaml = (serverRequest, serverResponse) => {
  try {
    const operatorName = serverRequest.url.replace('/install/', '').replace('.yaml', '');
    persistentStore.getVersionedOperator(operatorName, (operator, err) => {
      if (err) {
        serverResponse.status(500).send(err);
        return;
      }
      const { channels, packageName, globalOperator } = operator;
      if (!_.size(channels) || !packageName) {
        serverResponse.status(500).send(`Operator ${operatorName} has invalid or no package information.`);
        return;
      }
      const operatorChannel = channels[0].name;

      const installYaml = `apiVersion: v1
kind: Namespace
metadata:
  name: my-${packageName}
---
apiVersion: operators.coreos.com/v1alpha1
kind: CatalogSource
metadata:
  name: operatorhubio-catalog
  namespace: my-${packageName}
spec:
  sourceType: grpc
  image: ${quayCatalogSourceImage}
  displayName: Community Operators
  publisher: OperatorHub.io
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
  sourceNamespace: my-${packageName}`;

      const globalInstallYaml = `apiVersion: operators.coreos.com/v1alpha1
kind: CatalogSource
metadata:
  name: operatorhubio-catalog
  namespace: olm
spec:
  sourceType: grpc
  image: ${quayCatalogSourceImage}
  displayName: Community Operators
  publisher: OperatorHub.io
---
apiVersion: operators.coreos.com/v1alpha1
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
  } catch (e) {
    serverResponse.status(500).send(e.message);
  }
};

const yamlService = {
  generateInstallYaml
};

module.exports = yamlService;
