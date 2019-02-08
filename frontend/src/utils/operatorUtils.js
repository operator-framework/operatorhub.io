import * as _ from 'lodash-es';
import * as versionSort from 'version-sort';

const addVersionedOperator = (operators, newOperator) => {
  const existingOperator = _.find(operators, { displayName: newOperator.displayName });
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

export { getVersionedOperators };
