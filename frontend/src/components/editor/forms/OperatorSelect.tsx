import React from 'react';
import _ from 'lodash-es';
import PropTypes from 'prop-types';

import { operatorFieldPlaceholders } from '../../../utils/operatorDescriptors';
import OperatorInputWrapper from './OperatorInputWrapper';
import EditorSelect from '../EditorSelect';


 export interface OperatorSelectProps{
  title: string
  field: string
  formErrors: any
  values: string[]
  options: string[]
  updateOperator: (field: string, values: string[]) => void
  commitField: (field: string) => void
  placeholder?: string
  descriptions?: any,
  isMulti?: boolean
  customSelect?: boolean
  emptyLabel?: string
  newSelectionPrefix?: string
 }

/**
 * Create input wrapped into Operator Editor styling
 */
const OperatorSelect: React.FC<OperatorSelectProps> = ({
  title,
  field,
  formErrors,
  values,
  options,
  isMulti,
  updateOperator, 
  commitField,
  placeholder,
  descriptions,
  ...otherProps
}) => (
  <OperatorInputWrapper title={title} field={field} formErrors={formErrors} descriptions={descriptions}>
    <EditorSelect
      id={_.camelCase(field)}
      values={values}
      isMulti={isMulti}
      options={options}
      {...otherProps}
      placeholder={placeholder ? placeholder : _.get(operatorFieldPlaceholders, field)}
      onChange={selection => updateOperator(field, selection)}
      onBlur={() => commitField(field)}
    />
  </OperatorInputWrapper>
);

OperatorSelect.propTypes = {
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  values: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  formErrors: PropTypes.any.isRequired,
  isMulti: PropTypes.bool,
  customSelect: PropTypes.bool,
  newSelectionPrefix: PropTypes.string,
  emptyLabel: PropTypes.string,
  commitField: PropTypes.func.isRequired,
  updateOperator: PropTypes.func.isRequired
};

OperatorSelect.defaultProps = {
  isMulti: true,
  customSelect: false,
  emptyLabel: undefined,
  newSelectionPrefix: undefined
};

export default OperatorSelect;
