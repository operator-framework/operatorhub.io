import * as _ from 'lodash-es';
import * as versionSort from 'version-sort';

const addVersionedOperator = (operators, newOperator) => {
  const existingOperator = _.find(operators, { id: newOperator.id });
  if (existingOperator) {
    if (!existingOperator.versions) {
      existingOperator.versions = [existingOperator];
    }
    existingOperator.versions.push(newOperator);
  }
  return !!existingOperator;
};

const getVersionedOperators = operators => {
  const uniqueOperators = _.reduce(
    operators,
    (versionedOperators, operator) => {
      if (!addVersionedOperator(versionedOperators, operator)) {
        versionedOperators.push(operator);
      }
      return versionedOperators;
    },
    []
  );

  return _.map(uniqueOperators, operator => {
    if (!operator.versions) {
      return operator;
    }

    const sortedOperators = _.reverse(versionSort(operator.versions, { nested: 'versionForCompare' }));
    const latestOperator = sortedOperators[0];
    latestOperator.version = `${latestOperator.version} (latest)`;

    operator.versions = sortedOperators;
    _.forEach(operator.versions, nextVersion => {
      nextVersion.versions = sortedOperators;
    });

    return latestOperator;
  });
};

const normalizeVersion = version => {
  let normVersion = version.replace(/-beta/gi, 'beta');
  normVersion = normVersion.replace(/-alpha/gi, 'alpha');

  return normVersion;
};

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
    throw new Error(`Unable to parse alm-examples. ${e.message}`);
  }
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

const generateIdFromVersionedName = name => name.slice(0, name.indexOf('.'));

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
    capabilityLevel: normalizeCapabilityLevel(annotations.capabilities || ''),
    links: spec.links,
    repository: annotations.repository,
    maintainers: spec.maintainers,
    description: _.get(annotations, 'description'),
    categories: categoriesString && _.map(categoriesString.split(','), category => category.trim()),
    createdAt: annotations.createdAt && `${annotations.createdAt}`,
    containerImage: annotations.containerImage,
    customResourceDefinitions: normalizeCRDs(operator),
    packageName: packageInfo.packageName,
    channels: packageInfo.channels,
    globalOperator: isGlobalOperator(_.get(spec, 'installModes'))
  };
};

export { generateIdFromVersionedName, normalizeOperator, getVersionedOperators };
