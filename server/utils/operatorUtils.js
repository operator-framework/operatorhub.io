const _ = require('lodash');

const normalizeVersion = version =>
  version
    .split('.')
    .map(versionField => {
      if (versionField.indexOf('-') === -1) {
        return +versionField + 100000;
      }
      return versionField
        .split('-')
        .map(fieldPart => (_.isNaN(+fieldPart) ? fieldPart : +fieldPart + 100000))
        .join('-');
    })
    .join('.');

const validCapabilityStrings = ['Basic Install', 'Seamless Upgrades', 'Full Lifecycle', 'Deep Insights', 'Auto Pilot'];

const normalizeCapabilityLevel = capability => {
  if (validCapabilityStrings.includes(capability)) {
    return capability;
  }
  return validCapabilityStrings[0];
};

const getExampleYAML = (kind, operator) => {
  const examples = _.get(operator, 'metadata.annotations.alm-examples');
  if (!examples) {
    return null;
  }

  try {
    const yamlExamples = JSON.parse(examples);
    return _.find(yamlExamples, { kind });
  } catch (e) {
    console.error(e);
  }
  return null;
};

const addReplacedOperators = (packageChannel, currentOperator, operators) => {
  const replacedOperatorName = _.get(currentOperator, 'replaces');
  if (!replacedOperatorName) {
    return;
  }

  const replacedOperator = _.find(operators, { name: replacedOperatorName });
  if (replacedOperator) {
    packageChannel.versions.push({ name: replacedOperator.name, version: replacedOperator.version });
    addReplacedOperators(packageChannel, replacedOperator, operators);
  }
};

const getPackageChannels = (operatorPackage, operators) => {
  const { channels } = operatorPackage;

  const packageChannels = _.map(channels, channel => {
    const packageChannel = {
      name: channel.name,
      currentCSV: channel.currentCSV
    };

    const currentOperator = _.find(operators, { name: channel.currentCSV });
    if (!currentOperator) {
      console.error(
        `ERROR: package ${operatorPackage.packageName}, channel ${
          channel.name
        } has a missing or invalid currentCSV value.`
      );
      return null;
    }

    packageChannel.versions = [{ name: currentOperator.name, version: currentOperator.version }];

    addReplacedOperators(packageChannel, currentOperator, operators);
    return packageChannel;
  });

  return _.compact(packageChannels);
};

const getDefaultChannel = (operatorPackage, channels, operators) => {
  // if we have a set default channel use it
  const defaultChannelName = _.get(operatorPackage, 'defaultChannel');
  if (defaultChannelName) {
    const defaultChannel = _.find(channels, { name: defaultChannelName });
    if (defaultChannel) {
      return defaultChannel;
    }
  }

  // If there is only 1 channel, use it
  if (channels.length === 1) {
    return channels[0];
  }

  // Get all the versions of the operators
  const packageOperators = _.filter(operators, { packageName: operatorPackage.packageName });
  const versionObjects = _.reduce(
    packageOperators,
    (reducedOperators, packageOperator) => {
      reducedOperators.push({ name: packageOperator.name, version: normalizeVersion(packageOperator.version) });
      return reducedOperators;
    },
    []
  );

  // Get the latest version
  const sortedVersions = _.reverse(_.sortBy(versionObjects, versionObject => versionObject.version));
  const latestOperator = _.find(operators, { name: _.get(_.first(sortedVersions), 'name') });

  // Return the channel with the latest version
  return _.find(channels, channel =>
    _.find(channel.versions, nextVersion => nextVersion.name === _.get(latestOperator, 'name'))
  );
};

const normalizeCRD = (crd, operator) => ({
  name: _.get(crd, 'name', 'Name Not Available'),
  kind: crd.kind,
  displayName: _.get(crd, 'displayName', 'Name Not Available'),
  description: _.get(crd, 'description', 'No description available'),
  yamlExample: getExampleYAML(crd.kind, operator)
});

const normalizeCRDs = operator => {
  const customResourceDefinitions = _.get(operator, 'spec.customresourcedefinitions.owned');
  return _.map(customResourceDefinitions, crd => normalizeCRD(crd, operator));
};

/**
 * Returns operator name without version as operator Id
 * Cover case when there is no version in name
 * @param {string} name
 */
const generateIdFromVersionedName = name => {
  let operatorId = name;

  // use method only if there is dot
  if (operatorId.indexOf('.') > -1) {
    operatorId = operatorId.slice(0, name.indexOf('.'));
  }

  return operatorId;
};

const isGlobalOperator = installModes => _.some(installModes, { type: 'AllNamespaces', supported: true });

const normalizeOperator = operator => {
  const annotations = _.get(operator, 'metadata.annotations', {});
  const spec = _.get(operator, 'spec', {});
  const iconObj = _.get(spec, 'icon[0]');
  const categoriesString = _.get(annotations, 'categories');
  const packageInfo = _.get(operator, 'packageInfo', {});

  return {
    id: generateIdFromVersionedName(operator.metadata.name),
    name: operator.metadata.name,
    displayName: _.get(spec, 'displayName', operator.metadata.name),
    imgUrl: iconObj ? `data:${iconObj.mediatype};base64,${iconObj.base64data}` : '',
    longDescription: _.get(spec, 'description', annotations.description),
    provider: _.get(spec, 'provider.name'),
    version: spec.version,
    versionForCompare: normalizeVersion(spec.version),
    replaces: spec.replaces,
    capabilityLevel: normalizeCapabilityLevel(annotations.capabilities || ''),
    links: spec.links,
    repository: annotations.repository,
    maintainers: spec.maintainers,
    description: _.get(annotations, 'description'),
    categories: categoriesString && _.map(categoriesString.split(','), category => category.trim()),
    keywords: spec.keywords,
    createdAt: annotations.createdAt,
    containerImage: annotations.containerImage,
    customResourceDefinitions: normalizeCRDs(operator),
    packageName: packageInfo.packageName,
    globalOperator: isGlobalOperator(_.get(spec, 'installModes'))
  };
};

const normalizeOperators = operators => _.map(operators, operator => normalizeOperator(operator));

const normalizePackage = (operatorPackage, operators) => {
  const channels = getPackageChannels(operatorPackage, operators);
  const defaultChannel = getDefaultChannel(operatorPackage, channels, operators);

  return {
    id: operatorPackage.packageName,
    name: operatorPackage.packageName,
    channels,
    defaultChannel: _.get(defaultChannel, 'name'),
    defaultOperatorId: _.get(defaultChannel, 'currentCSV')
  };
};

const normalizePackages = (packages, operators) =>
  _.map(packages, operatorPackage => normalizePackage(operatorPackage, operators));

const operatorUtils = {
  generateIdFromVersionedName,
  normalizeOperator,
  normalizeOperators,
  normalizePackage,
  normalizePackages
};

module.exports = operatorUtils;
