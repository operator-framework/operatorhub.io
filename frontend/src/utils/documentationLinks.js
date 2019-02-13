const operatorsFramework = 'https://github.com/operator-framework';
const operatorsRepo = `${operatorsFramework}/community-operators`;
const contributions = `${operatorsRepo}/tree/master/community-operators`;
const operatorSdk = `${operatorsFramework}/operator-sdk`;
const olm = `${operatorsFramework}/operator-lifecycle-manager`;
const gettingStarted = `${operatorsFramework}/getting-started`;
const marketplaceRef = `${operatorsFramework}/operator-marketplace`;
const prometheusOperator = `${operatorsRepo}/tree/master/community-operators/prometheus`;
const olmArchitecture = `${olm}/blob/master/Documentation/design/architecture.md`;
const buildYourCSV = `${olm}/blob/master/Documentation/design/building-your-csv.md`;
const installInstructions = `${olm}/blob/master/Documentation/install/install.md`;
const introBlog = `https://coreos.com/blog/introducing-operators.html`;
const sampleCode = `${operatorsFramework}/operator-sdk-samples/blob/master/memcached-operator/pkg/controller/memcached/memcached_controller.go#L77`;

const DocmentationLinks = {
  operatorsFramework,
  operatorsRepo,
  contributions,
  operatorSdk,
  olm,
  gettingStarted,
  marketplaceRef,
  prometheusOperator,
  olmArchitecture,
  buildYourCSV,
  installInstructions,
  introBlog,
  sampleCode
};

export {
  DocmentationLinks,
  operatorsFramework,
  operatorsRepo,
  contributions,
  operatorSdk,
  olm,
  gettingStarted,
  marketplaceRef,
  prometheusOperator,
  olmArchitecture,
  buildYourCSV,
  installInstructions,
  introBlog,
  sampleCode
};
