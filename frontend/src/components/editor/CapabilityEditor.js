import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';

import { validCapabilityStrings } from '../../utils/operatorUtils';
import { capabilityDescriptions, operatorFieldDescriptions } from '../../utils/operatorDescriptors';

class CapabilityEditor extends React.Component {
  state = {
    isSliding: false,
    initialPosition: 0,
    slidePosition: 0
  };

  updateCapability = capability => {
    this.props.onUpdate(capability);
  };

  startSliding = event => {
    this.setState({
      isSliding: true,
      initialPosition: event.clientX,
      slidePosition: 0
    });
  };

  stopSliding = () => {
    if (this.state.isSliding) {
      const capabilityCount = validCapabilityStrings.length;
      const capabilityValue = validCapabilityStrings.indexOf(
        _.get(this.props.operator, 'metadata.annotations.capabilities', validCapabilityStrings[0])
      );

      const capabilityWidth = this.sliderRef.clientWidth / capabilityCount;
      const capabilityDelta = Math.round(this.state.slidePosition / capabilityWidth);

      const newValue = capabilityValue + capabilityDelta;
      this.updateCapability(validCapabilityStrings[newValue]);

      this.setState({ isSliding: false });
    }
  };

  moveSlider = event => {
    if (this.state.isSliding) {
      const delta = event.clientX - this.state.initialPosition;
      this.setState({ slidePosition: delta });
    }
  };

  render() {
    const { operator } = this.props;
    const { isSliding, slidePosition } = this.state;

    const capabilityValue = validCapabilityStrings.indexOf(
      _.get(operator, 'metadata.annotations.capabilities', validCapabilityStrings[0])
    );

    const capabilityCount = validCapabilityStrings.length;
    const barStyle = {};
    const handleStyle = {};
    if (!isSliding && capabilityValue === 0) {
      barStyle.width = '6px';
      handleStyle.left = '6px';
    } else {
      const endPosition = (capabilityValue * 100) / capabilityCount;
      barStyle.width = `${endPosition}%`;
      handleStyle.left = `${endPosition}%`;
    }

    if (isSliding) {
      barStyle.width = `calc(${barStyle.width} + ${slidePosition}px)`;
      handleStyle.left = `calc(${handleStyle.left} + ${slidePosition}px)`;
    }

    return (
      <React.Fragment>
        <h3>Capabilities</h3>
        <p>{operatorFieldDescriptions.metadata.annotations.capabilities}</p>
        <div
          className="oh-operator-editor-form__field-section oh-operator-editor-form__capabilities"
          onMouseMove={this.moveSlider}
          onMouseUp={this.stopSliding}
          onMouseLeave={this.stopSliding}
        >
          <div
            className="oh-operator-editor-form__capabilities__slider"
            ref={ref => {
              this.sliderRef = ref;
            }}
          >
            <div
              className="oh-operator-editor-form__capabilities__slider__background"
              style={{ width: `${((capabilityCount - 1) * 100) / capabilityCount}%` }}
            />
            <div className="oh-operator-editor-form__capabilities__slider__bar" style={barStyle} />
            <div
              className="oh-operator-editor-form__capabilities__slider__handle"
              style={handleStyle}
              onMouseDown={this.startSliding}
            />
            {_.map(validCapabilityStrings, (capability, index) =>
              isSliding || index !== capabilityValue ? (
                <div
                  key={capability}
                  className="oh-operator-editor-form__capabilities__slider__tick"
                  style={{ left: `${(index * 100) / capabilityCount}%` }}
                  onClick={() => this.updateCapability(capability)}
                >
                  <span className="oh-operator-editor-form__capabilities__slider__tick__marker" />
                </div>
              ) : null
            )}
          </div>
          <div className="oh-operator-editor-form__capabilities__text-container">
            {_.map(validCapabilityStrings, (capability, index) => (
              <div
                key={capability}
                className="oh-operator-editor-form__capabilities__text"
                style={{ left: `${(index * 100) / capabilityCount}%` }}
                onClick={() => this.updateCapability(capability)}
              >
                <h4 className="oh-operator-editor-form__capabilities__text__title">{capability}</h4>
                <div className="oh-operator-editor-form__capabilities__text__description">
                  {capabilityDescriptions[index]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

CapabilityEditor.propTypes = {
  operator: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default CapabilityEditor;
