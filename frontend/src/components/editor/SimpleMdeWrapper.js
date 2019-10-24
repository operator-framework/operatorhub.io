import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import SimpleMDE from 'simplemde';
import { helpers } from '../../common';

class SimpleMdeWrapper extends React.Component {
  simpleMDE = null;

  componentDidMount() {
    const { options, markdown, onReady } = this.props;

    this.simpleMDE = new SimpleMDE(
      _.assign({}, options, {
        element: this.simpleMdeTextArea
      })
    );

    if (!this.simpleMDE) {
      return;
    }

    this.simpleMDE.value(markdown);

    this.simpleMDE.codemirror.on('change', this.onMarkdownChange);
    this.simpleMDE.codemirror.on('blur', this.onMarkdownBlur);

    setTimeout(() => onReady(this.simpleMDE));
  }

  componentWillUnmount() {
    if (!this.simpleMDE) {
      return;
    }

    this.simpleMDE.codemirror.off('change', this.onMarkdownChange);
    this.simpleMDE.codemirror.off('blur', this.onMarkdownBlur);
    this.simpleMDE.toTextArea();
  }

  onMarkdownBlur = () => {
    const { onBlur } = this.props;
    onBlur(this.simpleMDE.value());
  };

  onMarkdownChange = () => {
    const { onChange } = this.props;
    onChange(this.simpleMDE.value());
  };

  setTextArea = ref => {
    this.simpleMdeTextArea = ref;
  };

  render() {
    const { className, style } = this.props;

    return <textarea className={className} style={style} ref={this.setTextArea} />;
  }
}

SimpleMdeWrapper.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  options: PropTypes.object,
  markdown: PropTypes.string,
  onReady: PropTypes.func,
  onChange: PropTypes.func,
  onBlur: PropTypes.func
};

SimpleMdeWrapper.defaultProps = {
  className: '',
  style: {},
  options: {},
  markdown: '',
  onReady: helpers.noop,
  onChange: helpers.noop,
  onBlur: helpers.noop
};

export default SimpleMdeWrapper;
