import React from 'react';
import PropTypes from 'prop-types';
import { EmptyState, Alert } from 'patternfly-react';

/**
 * Display error message block
 * @param {object} param0
 * @param {string} param0.errorText
 */
const ErrorMessage = ({ errorText }) => (
  <EmptyState className="blank-slate-content-pf">
    <Alert type="error">
      <span>{errorText}</span>
    </Alert>
  </EmptyState>
);

ErrorMessage.propTypes = {
  errorText: PropTypes.string.isRequired
};

export default ErrorMessage;
