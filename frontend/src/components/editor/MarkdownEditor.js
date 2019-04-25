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

  static mdeOptions = {
    spellChecker: false,
    status: false,
    showIcons: ['code', 'table'],
    hideIcons: ['side-by-side', 'fullscreen'],
    previewRender: helpers.markdownConverter.makeHtml
  };

  static ToolbarWithLevel3Headline = [
    'bold', 'italic',
    {
      name: "heading-smaller",
      action: (editor) => {
        const cm = editor.codemirror;
        const text = cm.getLine(cm.getCursor("start").line);
        const currHeadingLevel = text.search(/[^#]/);
  
        currHeadingLevel < 3 ?  editor.toggleHeading3() : editor.toggleHeadingSmaller();
      },
      className: "fa fa-header",
      title: "Smaller Heading",
    },
    '|', 'code', 'quote', 'unordered-list', 'ordered-list',
    '|', 'link', 'image', 'table',
    '|', 'preview', 'guide'
  ];

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
    const { title, description, markdown, minHeadlineLevel3 } = this.props;
    const { contentHeight } = this.state;

    const mdeConfig = MarkdownEditor.mdeOptions;

    if(minHeadlineLevel3){
      mdeConfig.toolbar = MarkdownEditor.ToolbarWithLevel3Headline;
    }

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
            options={mdeConfig}
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
  minHeadlineLevel3: PropTypes.bool,
  onChange: PropTypes.func,
  onValidate: PropTypes.func
};

MarkdownEditor.defaultProps = {
  markdown: '',
  onChange: helpers.noop,
  onValidate: helpers.noop,
  minHeadlineLevel3: false
};

export default MarkdownEditor;
