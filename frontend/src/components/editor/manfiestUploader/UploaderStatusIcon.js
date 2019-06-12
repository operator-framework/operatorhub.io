import React from 'react';
import { Icon } from 'patternfly-react';
import PropTypes from 'prop-types';

export const IconStatus = {
  SUCCESS: 'check-circle',
  ERROR: 'times-circle',
  MISSING: 'upload'
};

/**
 * Upload result icon with type of 'success' or 'failure' or 'missing
 */
function UploaderStatusIcon({ status, text }) {
  return (
    <span className="oh-operator-editor-upload__uploads__status">
      <Icon type="fa" name={status} />
      <span className="oh-operator-editor-upload__uploads__status__message">{text}</span>
    </span>
  );
}

UploaderStatusIcon.propTypes = {
  status: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
};

export default UploaderStatusIcon;
