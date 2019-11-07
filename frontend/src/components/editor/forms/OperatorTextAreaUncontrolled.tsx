import React from 'react';
import _ from 'lodash-es';
import PropTypes from 'prop-types';

import { operatorFieldPlaceholders, operatorFieldDescriptions } from '../../../utils/operatorDescriptors';
import OperatorInputWrapper from './OperatorInputWrapper';
import { noop } from '../../../common/helpers';
import { operatorFieldValidators } from '../../../utils/operatorValidators';
import { SharedOperatorInputProps } from './OperatorFormTypes';

export interface OperatorTextAreaUncontrolledProps extends SharedOperatorInputProps {
  defaultValue: string
}

/**
 * Create input wrapped into Operator Editor styling
 */
const OperatorTextAreaUncontrolled: React.FC<OperatorTextAreaUncontrolledProps> = ({
  title,
  field,
  defaultValue,
  formErrors,
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
      onBlur={e => commitField(field, e.target.value)}
      placeholder={_.get(operatorFieldPlaceholders, field)}
      defaultValue={defaultValue}
      ref={refCallback}
    />
  </OperatorInputWrapper>
);

OperatorTextAreaUncontrolled.propTypes = {
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  formErrors: PropTypes.any.isRequired,
  commitField: PropTypes.func.isRequired,
  defaultValue: PropTypes.string.isRequired,
  refCallback: PropTypes.func,
  descriptions: PropTypes.object
};

OperatorTextAreaUncontrolled.defaultProps = {
  refCallback: noop,
  descriptions: operatorFieldDescriptions
};

export default OperatorTextAreaUncontrolled;
