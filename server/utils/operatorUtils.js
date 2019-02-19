const _ = require('lodash');

const normalizeVersion = version => {
  let normVersion = version.replace(/-beta/gi, 'beta');
  normVersion = normVersion.replace(/-alpha/gi, 'alpha');

  return normVersion;
};

const normalizeMaturity = maturityString => {
  let maturity;

  switch (maturityString.toLowerCase()) {
    case 'alpha':
      maturity = 'Basic Install';
      break;
    case 'beta':
      maturity = 'Seamless Upgrades';
      break;
    case 'stable':
      maturity = 'Full Lifecycle';
      break;
    case 'insights':
      maturity = 'Deep Insights';
      break;
    case 'auto-pilot':
      maturity = 'Auto Pilot';
      break;
    default:
      maturity = 'Basic Install';
  }
  return maturity;
};

const normalizeOperator = operator => {
  const annotations = _.get(operator, 'metadata.annotations', {});
  const spec = _.get(operator, 'spec', {});
  const iconObj = _.get(spec, 'icon[0]');

  return {
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
    containerImage: annotations.containerImage
  };
};

const normalizeOperators = operators => _.map(operators, operator => normalizeOperator(operator));

const operatorUtils = {
  normalizeOperator,
  normalizeOperators
};

module.exports = operatorUtils;
