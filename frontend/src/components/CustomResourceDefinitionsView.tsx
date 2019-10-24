import React from 'react';
import PropTypes from 'prop-types';

import { helpers } from '../common';
import { NormalizedOperatorPreview, NormalizedCrdPreview } from '../utils/operatorTypes';

export interface CustomResourceDefinitionsViewProps {
  operator: NormalizedOperatorPreview | null
  showExampleYaml: (e: React.MouseEvent, crd: NormalizedCrdPreview) => void
}

const CustomResourceDefinitionsView: React.FC<CustomResourceDefinitionsViewProps> = ({ operator, showExampleYaml }) => {
  if (!operator) {
    return null;
  }

  const { customResourceDefinitions=[] } = operator;

  if (customResourceDefinitions.length === 0) {
    return null;
  }

  const showExamples = customResourceDefinitions.some(crd => crd.yamlExample);

  return (
    <React.Fragment>
      <h3>Custom Resource Definitions</h3>
      <div className="oh-crd-tile-view">
        {customResourceDefinitions.map(crd => (
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
  operator: PropTypes.any.isRequired,
  showExampleYaml: PropTypes.func.isRequired
};

CustomResourceDefinitionsView.defaultProps = {
  operator: null,
  showExampleYaml: helpers.noop
};

export default CustomResourceDefinitionsView;
