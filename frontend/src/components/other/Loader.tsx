import React from 'react';
import PropTypes from 'prop-types';
import { EmptyState } from 'patternfly-react';

export interface LoaderProps{
  text: string
  style?: Record<string, any>
}

/**
 * Shows loading spinner with text
 */
const Loader: React.FC<LoaderProps> = ({ text, style }) => (
  <EmptyState className="blank-slate-content-pf" style={style}>
    <div className="loading-state-pf loading-state-pf-lg">
      <div className="spinner spinner-lg" />
      {text}
    </div>
  </EmptyState>
);

Loader.propTypes = {
  text: PropTypes.string.isRequired,
  style: PropTypes.object
};

Loader.defaultProps = {
  style: {}
};

export default Loader;
