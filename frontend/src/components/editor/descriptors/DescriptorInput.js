import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import classNames from 'classnames';
import { operatorFieldPlaceholders } from '../../../utils/operatorDescriptors';
import { sectionsFields } from '../../../pages/operatorBundlePage/bundlePageUtils';

/**
 * @callback DescriptorInputOnBlurCallback
 * @param {string} field
 * @param {string} value
 */

/**
 * Simple descriptor uncontrolled input with error and name
 * @param {object} param0
 * @param {string} param0.name
 * @param {string} param0.field
 * @param {string} param0.value
 * @param {string} param0.error
 * @param {DescriptorInputOnBlurCallback} param0.onBlur
 */
class DescriptorInput extends React.PureComponent {
  inputRef = null;

  componentDidUpdate(prevProps) {
    // handle clering component as React somehow leaves input with old value :(
    // input is uncontrolled so this happens only after blur
    if (this.inputRef && this.inputRef.value !== this.props.value) {
      this.inputRef.value = this.props.value;
    }
  }

  clearInput = () => {};

  onBlur = e => {
    const { field, onBlur } = this.props;

    onBlur(field, e.target.value);
  };

  render() {
    const { name, field, error, value } = this.props;

    const placeholder = _.get(operatorFieldPlaceholders, `${sectionsFields['owned-crds']}.descriptors.${field}`, '');
    const className = classNames('form-group', {
      'oh-operator-editor-form__field--error': !!error
    });

    return (
      <div className="col-sm-4">
        <span>{name}</span>
        <span className={className}>
          <input
            className="form-control"
            type="text"
            defaultValue={value}
            onBlur={e => this.onBlur(e)}
            placeholder={placeholder}
            ref={ref => {
              this.inputRef = ref;
            }}
          />

          {error && <div className="oh-operator-editor-form__error-block">{error}</div>}
        </span>
      </div>
    );
  }
}

DescriptorInput.propTypes = {
  name: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  value: PropTypes.string.isRequired,
  error: PropTypes.string,
  onBlur: PropTypes.func.isRequired
};

DescriptorInput.defaultProps = {
  error: null
};

export default DescriptorInput;
