const _ = require('lodash');

const normalizeVersion = version => {
  let normVersion = version.replace(/-beta/gi, 'beta');
  normVersion = normVersion.replace(/-alpha/gi, 'alpha');

  return normVersion;
};

const validMaturityStrings = ['Basic Install', 'Seamless Upgrades', 'Full Lifecycle', 'Deep Insights', 'Auto Pilot'];

const normalizeMaturity = maturity => {
  if (validMaturityStrings.includes(maturity)) {
    return maturity;
  }
  return validMaturityStrings[0];
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

const generateId = name => name.slice(0, name.indexOf('.'));

const normalizeOperator = operator => {
  const annotations = _.get(operator, 'metadata.annotations', {});
  const spec = _.get(operator, 'spec', {});
  const iconObj = _.get(spec, 'icon[0]');

  return {
    id: generateId(operator.metadata.name),
    name: operator.metadata.name,
    displayName: _.get(spec, 'displayName', operator.metadata.name),
    imgUrl: iconObj ? `data:${iconObj.mediatype};base64,${iconObj.base64data}` : '',
    longDescription: _.get(spec, 'description', annotations.description),
    provider: _.get(spec, 'provider.name'),
    version: spec.version,
    versionForCompare: normalizeVersion(spec.version),
    maturity: normalizeMaturity(spec.maturity || ''),
    links: spec.links,
    maintainers: spec.maintainers,
    description: _.get(annotations, 'description'),
    createdAt: annotations.createdAt,
    containerImage: annotations.containerImage,
    customResourceDefinitions: normalizeCRDs(operator)
  };
};

const normalizeOperators = operators => _.map(operators, operator => normalizeOperator(operator));

const operatorUtils = {
  normalizeOperator,
  normalizeOperators
};

module.exports = operatorUtils;
