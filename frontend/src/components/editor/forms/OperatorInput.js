import React from 'react';
import classNames from 'classnames';
import _ from 'lodash-es';
import PropTypes from 'prop-types';

import { operatorFieldDescriptions } from '../../../utils/operatorDescriptors';
import { renderFormError } from '../../../pages/operatorBundlePage/bundlePageUtils';

/**
 * Create input wrapped into Operator Editor styling
 * @param {object} param0
 * @param {string} param0.title
 * @param {string} param0.field
 * @param {JSX.Element} param0.children
 * @param {*} param0.formErrors
 */
const OperatorInput = ({ title, field, children, formErrors }) => {
  const formFieldClasses = classNames({
    'oh-operator-editor-form__field': true,
    row: true,
    'oh-operator-editor-form__field--error': _.get(formErrors, field)
  });

  return (
    <div className={formFieldClasses}>
      <div className="form-group col-sm-6">
        <label htmlFor={field}>{title}</label>
        {children}
        {renderFormError(field, formErrors)}
      </div>
      <div className="oh-operator-editor-form__description col-sm-6">{_.get(operatorFieldDescriptions, field, '')}</div>
    </div>
  );
};

OperatorInput.propTypes = {
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  formErrors: PropTypes.any.isRequired
};

export default OperatorInput;
