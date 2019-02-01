import * as _ from 'lodash-es';
import * as versionSort from 'version-sort';
import * as operatorImg from '../imgs/operator.svg';

const addVersionedOperator = (operators, newOperator) => {
  const existingOperator = _.find(operators, { name: newOperator.name });
  if (existingOperator) {
    if (!existingOperator.versions) {
      existingOperator.versions = [existingOperator];
    }
    existingOperator.versions.push(newOperator);
  }
  return !!existingOperator;
};

const normalizeVersion = version => {
  let normVersion = version.replace(/-beta/gi, 'beta');
  normVersion = normVersion.replace(/-alpha/gi, 'alpha');

  return normVersion;
};

const normalizeOperator = operator => {
  const annotations = _.get(operator, 'metadata.annotations', {});
  const spec = _.get(operator, 'spec', {});
  const iconObj = _.get(spec, 'icon[0]');

  return {
    obj: operator,
    name: _.get(spec, 'displayName', operator.metadata.name),
    imgUrl: iconObj ? `data:${iconObj.mediatype};base64,${iconObj.base64data}` : operatorImg,
    longDescription: _.get(spec, 'description', annotations.description),
    provider: _.get(spec, 'provider.name'),
    version: spec.version,
    versionForCompare: normalizeVersion(spec.version),
    maturity: spec.maturity || '',
    links: spec.links,
    maintainers: spec.maintainers,
    description: _.get(annotations, 'description'),
    createdAt: annotations.createdAt,
    containerImage: annotations.containerImage
  };
};

const normalizeOperators = operators => _.map(operators, operator => normalizeOperator(operator));

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

    const sortedOperators = versionSort(operator.versions, { nested: 'versionForCompare' });
    const latestOperator = sortedOperators[sortedOperators.length - 1];
    latestOperator.version = `${latestOperator.version} (latest)`;

    operator.versions = sortedOperators;
    _.forEach(operator.versions, nextVersion => {
      nextVersion.versions = sortedOperators;
    });

    return latestOperator;
  });
};

export { normalizeOperator, normalizeOperators, getVersionedOperators };
