import * as React from 'react';
import PropTypes from 'prop-types';
import { TypeAheadSelect } from 'patternfly-react';

import { helpers } from '../../common/helpers';

/**
 * Select with search and option to add new tags
 * @param {object} param0
 * @param {string} param0.id
 * @param {string[]=} param0.values
 * @param {string[]=} param0.options
 * @param {boolean} [param0.isMulti=true]
 * @param {boolean} [param0.customSelect=false]
 * @param {string=} param0.placeholder
 * @param {boolean=} param0.dropup
 * @param {function=} param0.onChange
 * @param {function=} param0.onBlur
 * @param {boolean=} param0.clearButton
 * @param {string=} param0.emptyLabel
 * @param {string=} param0.newSelectionPrefix
 * @param {function} [param0.customSelectValidator]
 */
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
  clearButton,
  emptyLabel,
  newSelectionPrefix,
  customSelectValidator,
  ...otherProps
}) => {
  let typeAhead = null;

  // when leaving the select, clear out any left over text that isn't a selection
  const typeAheadBlur = event => {
    if (typeAhead) {
      const currentText = typeAhead.getInstance().state.text;

      if (currentText && options.includes(currentText) && !values.includes(currentText)) {
        let updatedValues;
        if (isMulti) {
          updatedValues = [...values, currentText];
        } else {
          updatedValues = [currentText];
        }
        onChange(updatedValues);
      }

      const inputEvent = new Event('input', { bubbles: true });
      typeAhead.getInstance().setState({ text: '' });
      typeAhead.getInstance().props.onInputChange('', inputEvent);
    }

    setTimeout(() => onBlur(event), 10);
  };

  return (
    <div className="oh-operator-editor-form__select">
      <TypeAheadSelect
        id={id}
        multiple={isMulti}
        options={options}
        selected={values}
        allowNew={customSelectValidator || customSelect}
        dropup={dropup}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={typeAheadBlur}
        positionFixed
        ref={ref => {
          typeAhead = ref;
        }}
        {...otherProps}
      />
    </div>
  );
};

EditorSelect.propTypes = {
  id: PropTypes.string.isRequired,
  values: PropTypes.array,
  options: PropTypes.array,
  isMulti: PropTypes.bool,
  customSelect: PropTypes.bool,
  dropup: PropTypes.bool,
  clearButton: PropTypes.bool,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  emptyLabel: PropTypes.string,
  newSelectionPrefix: PropTypes.string,
  customSelectValidator: PropTypes.func
};

EditorSelect.defaultProps = {
  values: [],
  options: [],
  isMulti: true,
  customSelect: false,
  dropup: false,
  clearButton: false,
  placeholder: 'Select options',
  onChange: helpers.noop,
  onBlur: helpers.noop,
  emptyLabel: undefined,
  newSelectionPrefix: undefined,
  customSelectValidator: undefined
};

export default EditorSelect;
