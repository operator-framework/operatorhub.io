import React from 'react';
import _ from 'lodash-es';

import { operatorFieldValidators, operatorFieldPlaceholders } from '../../../utils/operatorDescriptors';
import OperatorInput from './OperatorInput';

export const renderOperatorFormField = (operator, formErrors, updateOperator, commitField, title, field, fieldType) => {
  let inputComponent;

  if (fieldType === 'text-area') {
    inputComponent = (
      <textarea
        id={field}
        className="form-control"
        rows={3}
        {..._.get(_.get(operatorFieldValidators, field), 'props')}
        onChange={e => updateOperator(e.target.value, field)}
        onBlur={() => commitField(field)}
        value={_.get(operator, field, '')}
        placeholder={_.get(operatorFieldPlaceholders, field)}
      />
    );
  } else {
    inputComponent = (
      <input
        id={field}
        className="form-control"
        type={fieldType}
        {..._.get(_.get(operatorFieldValidators, field), 'props')}
        onChange={e => updateOperator(e.target.value, field)}
        onBlur={() => commitField(field)}
        value={_.get(operator, field, '')}
        placeholder={_.get(operatorFieldPlaceholders, field)}
      />
    );
  }

  return (
    <OperatorInput title={title} field={field} formErrors={formErrors}>
      {inputComponent}
    </OperatorInput>
  );
};
