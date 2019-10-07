import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import { helpers } from '../common';

const CustomResourceDefinitionsView = ({ operator, showExampleYaml }) => {
  if (!operator) {
    return null;
  }

  const { customResourceDefinitions } = operator;

  if (!_.size(customResourceDefinitions)) {
    return null;
  }

  const showExamples = _.some(customResourceDefinitions, crd => crd.yamlExample);

  return (
    <React.Fragment>
      <h3>Custom Resource Definitions</h3>
      <div className="oh-crd-tile-view">
        {_.map(customResourceDefinitions, crd => (
          <div className="oh-crd-tile" key={crd.name}>
            <div className="oh-crd-tile__title">{crd.displayName}</div>
            <div className="oh-crd-tile__rule" />
            <div className="oh-crd-tile__description">{crd.description}</div>
            {showExamples && (
              <a
                className={`oh-crd-tile__link ${crd.yamlExample ? '' : 'oh-not-visible'}`}
                href="#"
                onClick={e => showExampleYaml(e, crd)}
              >
                <span>View YAML Example</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </React.Fragment>
  );
};

CustomResourceDefinitionsView.propTypes = {
  operator: PropTypes.object,
  showExampleYaml: PropTypes.func
};

CustomResourceDefinitionsView.defaultProps = {
  operator: null,
  showExampleYaml: helpers.noop
};

export default CustomResourceDefinitionsView;
