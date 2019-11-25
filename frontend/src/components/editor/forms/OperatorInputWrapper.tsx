import React from 'react';
import classNames from 'classnames';
import _ from 'lodash-es';
import PropTypes from 'prop-types';

import { operatorFieldDescriptions } from '../../../utils/operatorDescriptors';
import { renderFormError } from '../../../pages/operatorBundlePage/bundlePageUtils';

export interface OperatorInputWrapperProps{
  title: string
  field: string
  formErrors: any
  children: any
  descriptions?: any
}

/**
 * Create input wrapped into Operator Editor styling
 */
const OperatorInputWrapper: React.FC<OperatorInputWrapperProps> = ({ title, field, children, formErrors, descriptions }) => {
  const formFieldClasses = classNames({
    'oh-operator-editor-form__field': true,
    row: true,
    'oh-operator-editor-form__field--error': _.get(formErrors, field)
  });
  const description = _.get(descriptions, field, '');

  return (
    <div className={formFieldClasses}>
      <div className="form-group col-sm-6">
        <label htmlFor={field}>{title}</label>
        {children}
        {renderFormError(field, formErrors)}
      </div>
      <div className="oh-operator-editor-form__description col-sm-6">{description}</div>
    </div>
  );
};

OperatorInputWrapper.propTypes = {
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  formErrors: PropTypes.any.isRequired,
  descriptions: PropTypes.object
};

OperatorInputWrapper.defaultProps = {
  descriptions: operatorFieldDescriptions
};

export default OperatorInputWrapper;
