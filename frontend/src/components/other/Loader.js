import React from 'react';
import PropTypes from 'prop-types';
import { EmptyState } from 'patternfly-react';

/**
 * Shows loading spinner with text
 * @param {object} param0
 * @param {string} param0.text
 * @param {object} [param0.style]
 */
const Loader = ({ text, style }) => (
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
