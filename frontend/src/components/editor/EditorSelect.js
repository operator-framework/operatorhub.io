import * as React from 'react';
import PropTypes from 'prop-types';
import { TypeAheadSelect } from 'patternfly-react';

import { helpers } from '../../common/helpers';

const EditorSelect = ({
  id,
  values,
  options,
  isMulti,
  customSelect,
  placeholder,
  dropup,
  onChange,
  onBlur,
  ...otherProps
}) => (
  <span className="oh-operator-editor-form__select">
    <TypeAheadSelect
      id={id}
      multiple={isMulti}
      options={options}
      selected={values}
      allowNew={customSelect}
      clearButton
      dropup={dropup}
      placeholder={placeholder}
      onChange={onChange}
      onBlur={onBlur}
      positionFixed
      {...otherProps}
    />
  </span>
);

EditorSelect.propTypes = {
  id: PropTypes.string.isRequired,
  values: PropTypes.array,
  options: PropTypes.array,
  isMulti: PropTypes.bool,
  customSelect: PropTypes.bool,
  dropup: PropTypes.bool,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func
};

EditorSelect.defaultProps = {
  values: [],
  options: [],
  isMulti: true,
  customSelect: false,
  dropup: false,
  placeholder: 'Select options',
  onChange: helpers.noop,
  onBlur: helpers.noop
};

export default EditorSelect;
