import React from 'react';
import _ from 'lodash-es';
import PropTypes from 'prop-types';

import { operatorFieldPlaceholders, operatorFieldDescriptions } from '../../../utils/operatorDescriptors';
import OperatorInputWrapper from './OperatorInputWrapper';
import { noop } from '../../../common/helpers';
import { operatorFieldValidators } from '../../../utils/operatorValidators';
import { SharedOperatorInputProps, OperatorInputChangeCallback } from './OperatorFormTypes';

export interface OperatorTextAreaProps extends SharedOperatorInputProps{
  value: string|string[]|null
  updateOperator: OperatorInputChangeCallback
}

/**
 * Create input wrapped into Operator Editor styling 
 */
const OperatorTextArea: React.FC<OperatorTextAreaProps> = ({
  title,
  field,
  formErrors,
  value,
  updateOperator,
  commitField,
  refCallback,
  descriptions
}) => (
  <OperatorInputWrapper title={title} field={field} formErrors={formErrors} descriptions={descriptions}>
    <textarea
      id={field}
      className="form-control"
      rows={3}
      {..._.get(_.get(operatorFieldValidators, field), 'props')}
      onChange={e => updateOperator(field, e.target.value)}
      onBlur={e => commitField(field, e.target.value)}
      placeholder={_.get(operatorFieldPlaceholders, field)}
      value={value}
      ref={refCallback}
    />
  </OperatorInputWrapper>
);

OperatorTextArea.propTypes = {
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  formErrors: PropTypes.any.isRequired,
  commitField: PropTypes.func.isRequired,
  updateOperator: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  refCallback: PropTypes.func,
  descriptions: PropTypes.object
};

OperatorTextArea.defaultProps = {
  refCallback: noop,
  descriptions: operatorFieldDescriptions
};

export default OperatorTextArea;
