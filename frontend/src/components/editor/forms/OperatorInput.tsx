import React from 'react';
import _ from 'lodash-es';
import PropTypes from 'prop-types';

import { operatorFieldPlaceholders, operatorFieldDescriptions } from '../../../utils/operatorDescriptors';
import OperatorInputWrapper from './OperatorInputWrapper';
import { noop } from '../../../common/helpers';
import { operatorFieldValidators } from '../../../utils/operatorValidators';
import { OperatorInputChangeCallback, SharedOperatorInputProps } from './OperatorFormTypes';

export interface OperatorInputProps extends SharedOperatorInputProps {
  inputType: string 
  value: string|string[]|null 
  updateOperator: OperatorInputChangeCallback
}

/**
 * Create input wrapped into Operator Editor styling
 */
const OperatorInput: React.FC<OperatorInputProps> = ({
  title,
  field,
  inputType,
  formErrors,
  value,
  updateOperator,
  commitField,
  refCallback,
  descriptions
}) => (
  <OperatorInputWrapper title={title} field={field} formErrors={formErrors} descriptions={descriptions}>
    <input
      id={field}
      className="form-control"
      type={inputType}
      {..._.get(_.get(operatorFieldValidators, field), 'props')}
      onBlur={e => commitField(field, e.target.value)}
      onChange={e => updateOperator(field, e.target.value)}
      placeholder={_.get(operatorFieldPlaceholders, field)}
      value={value}
      ref={refCallback}
    />
  </OperatorInputWrapper>
);

OperatorInput.propTypes = {
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  inputType: PropTypes.string.isRequired,
  formErrors: PropTypes.any.isRequired,
  commitField: PropTypes.func.isRequired,
  updateOperator: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  refCallback: PropTypes.func,
  descriptions: PropTypes.object
};

OperatorInput.defaultProps = {
  refCallback: noop,
  descriptions: operatorFieldDescriptions
};

export default OperatorInput;
