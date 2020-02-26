/* eslint-disable no-undef */
import React from 'react';
import _ from 'lodash-es';
import PropTypes from 'prop-types';

import { operatorFieldPlaceholders, operatorFieldDescriptions } from '../../../utils/operatorDescriptors';
import OperatorInputWrapper from './OperatorInputWrapper';
import { noop } from '../../../common/helpers';
import { operatorFieldValidators } from '../../../utils/operatorValidators';
import { SharedOperatorInputProps } from './OperatorFormTypes';



export interface OperatorInputUncontrolledProps extends SharedOperatorInputProps {
  inputType: string
  defaultValue: string
}

/**
 * Create input wrapped into Operator Editor styling
 */
const OperatorInputUncontrolled: React.FC<OperatorInputUncontrolledProps> = ({
  title,
  field,
  inputType,
  formErrors,
  commitField,
  defaultValue,
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
      placeholder={_.get(operatorFieldPlaceholders, field)}
      defaultValue={defaultValue}
      ref={refCallback}
    />
  </OperatorInputWrapper>
);

OperatorInputUncontrolled.propTypes = {
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  inputType: PropTypes.string.isRequired,
  formErrors: PropTypes.any.isRequired,
  commitField: PropTypes.func.isRequired,
  defaultValue: PropTypes.string.isRequired,
  refCallback: PropTypes.func,
  descriptions: PropTypes.object
};

OperatorInputUncontrolled.defaultProps = {
  refCallback: noop,
  descriptions: operatorFieldDescriptions
};

export default OperatorInputUncontrolled;
