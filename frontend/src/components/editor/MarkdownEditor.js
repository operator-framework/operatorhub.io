import * as React from 'react';
import PropTypes from 'prop-types';
import { helpers } from '../../common/helpers';
import SimpleMdeWrapper from './SimpleMdeWrapper';

const MIN_HEIGHT = 250;

class MarkdownEditor extends React.Component {
  state = {
    contentHeight: MIN_HEIGHT,
    isDragging: false,
    initialPos: 0
  };

  onMarkdownChange = value => {
    this.props.onChange(value);
  };

  onMarkdownBlur = value => {
    this.props.onValidate(value);
  };

  startResize = event => {
    this.setState({
      isDragging: true,
      initialPos: event.clientY
    });
  };

  stopResize = () => {
    if (this.state.isDragging) {
      this.setState({ isDragging: false });
    }
  };

  resizeViewer = event => {
    if (this.state.isDragging) {
      const { contentHeight, initialPos } = this.state;
      const delta = event.clientY - initialPos;
      const newHeight = contentHeight + delta;

      if (newHeight >= MIN_HEIGHT) {
        this.setState({ initialPos: event.clientY, contentHeight: newHeight });
      }
    }
  };

  render() {
    const { title, description, markdown } = this.props;
    const { contentHeight } = this.state;

    const mdeOptions = {
      spellChecker: false,
      status: false,
      showIcons: ['code', 'table'],
      hideIcons: ['side-by-side', 'fullscreen'],
      previewRender: helpers.markdownConverter.makeHtml
    };

    return (
      <div
        className="oh-markdown-viewer"
        onMouseMove={this.resizeViewer}
        onMouseUp={this.stopResize}
        onMouseLeave={this.stopResize}
      >
        <h4>{title}</h4>
        <p>{description}</p>
        <div
          className="oh-markdown-viewer__content"
          style={contentHeight ? { height: contentHeight } : {}}
          ref={ref => {
            this.viewer = ref;
          }}
        >
          <SimpleMdeWrapper
            markdown={markdown}
            options={mdeOptions}
            onChange={this.onMarkdownChange}
            onBlur={this.onMarkdownBlur}
          />
        </div>
        <div className="oh-markdown-viewer__resizer" onMouseDown={this.startResize} />
      </div>
    );
  }
}

MarkdownEditor.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  markdown: PropTypes.string,
  onChange: PropTypes.func,
  onValidate: PropTypes.func
};

MarkdownEditor.defaultProps = {
  markdown: '',
  onChange: helpers.noop,
  onValidate: helpers.noop
};

export default MarkdownEditor;
