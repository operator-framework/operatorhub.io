import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import { safeDump } from 'js-yaml';
import { Icon } from 'patternfly-react';
import * as ace from 'brace';
import 'brace/ext/searchbox';
import 'brace/mode/yaml';
import 'brace/theme/clouds';
import 'brace/ext/language_tools';
import 'brace/snippets/yaml';
import copy from 'copy-to-clipboard';
import { Tooltip } from 'react-lightweight-tooltip';

let id = 0;

class YamlViewer extends React.Component {
  id = `edit-yaml-${++id}`;
  ace = null;
  doc = null;
  state = { copied: false };

  componentDidMount() {
    this.loadYaml();
  }

  componentWillUnmount() {
    if (this.ace) {
      this.ace.destroy();
      this.ace.container.parentNode.removeChild(this.ace.container);
      this.ace = null;
      window.ace = null;
    }

    this.doc = null;
  }

  copyToClipboard = e => {
    e.preventDefault();
    copy(this.doc.getValue());
    this.setState({ copied: true });
  };

  onCopyEnter = () => {
    this.setState({ copied: false });
  };

  loadYaml() {
    const { yamlObj } = this.props;
    if (!this.ace) {
      this.ace = ace.edit(this.id);
      window.ace = this.ace;

      // Squelch warning from Ace
      this.ace.$blockScrolling = Infinity;

      const es = this.ace.getSession();
      es.setMode('ace/mode/yaml');
      this.ace.setTheme('ace/theme/clouds');
      es.setUseWrapMode(true);
      this.doc = es.getDocument();
    }
    let yaml = '';

    if (yamlObj) {
      try {
        if (!_.isString(yamlObj)) {
          yaml = safeDump(yamlObj);
        } else {
          yaml = yamlObj;
        }
      } catch (e) {
        yaml = `Error dumping YAML: ${e}`;
      }
    }

    this.doc.setValue(yaml);
    this.ace.moveCursorTo(0, 0);
    this.ace.clearSelection();
    this.ace.setOption('scrollPastEnd', 0.1);
    this.ace.setOption('tabSize', 2);
    this.ace.setOption('showPrintMargin', false);

    this.ace.focus();
    this.ace.setReadOnly(true);
  }

  render() {
    const { yamlObj } = this.props;

    if (!yamlObj) {
      return null;
    }

    const tooltipText = this.state.copied ? 'Copied' : 'Copy to Clipboard';
    const tooltipContent = [
      <span className="oh-nowrap" key="nowrap">
        {tooltipText}
      </span>
    ];

    const tooltipOverrides = Object.freeze({
      wrapper: {
        cursor: 'pointer'
      },
      tooltip: {
        maxWidth: '170px',
        minWidth: 'auto'
      }
    });

    return (
      <div className="oh-yaml-viewer">
        <div className="oh-yaml-viewer__content">
          <div id={this.id} key={this.id} className="oh-yaml-viewer__acebox" />
          <div className="oh-yaml-viewer__copy-container">
            <Tooltip content={tooltipContent} styles={tooltipOverrides}>
              <a href="#" onClick={this.copyToClipboard} className="oh-yaml-viewer__copy" onMouseEnter={this.onCopyEnter}>
                <Icon type="fa" name="clipboard" />
                <span className="sr-only">Copy to Clipboard</span>
              </a>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
}

YamlViewer.propTypes = {
  yamlObj: PropTypes.object
};

YamlViewer.defaultProps = {
  yamlObj: null
};

export default YamlViewer;
