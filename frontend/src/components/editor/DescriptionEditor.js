import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';

import { operatorFieldDescriptions } from '../../utils/operatorDescriptors';
import MarkdownEditor from './MarkdownEditor';

const DescriptionEditor = ({ operator, onUpdate, onValidate }) => (
  <React.Fragment>
    <h3>Description</h3>
    <p>{operatorFieldDescriptions.spec.description}</p>
    <div className="oh-operator-editor-form__field-section">
      <MarkdownEditor
        title="Details about the managed application"
        description="Please describe the name, features, and use case(s) for your managed application briefly, and include links to read more about it."
        markdown={_.get(operator, 'spec.description')}
        onChange={markdown => onUpdate(markdown, 'spec.description')}
        onValidate={() => onValidate('spec.description')}
      />
      <MarkdownEditor
        title="Details about the Operator"
        description="Please describe the features your Operator provides to manage the application and what is it's value add."
        markdown={operator.aboutMarkdown}
        onChange={markdown => onUpdate(markdown, 'aboutMarkdown')}
        onValidate={() => onValidate('aboutMarkdown')}
      />
      <MarkdownEditor
        title="Details the prerequisites for enabling the Operator"
        description="Please describe any steps a user needs to take prior to enabling this Operator (e.g. any Secrets or ConfigMaps that need to be in place upfront)."
        markdown={operator.prerequisitesMarkdown}
        onChange={markdown => onUpdate(markdown, 'prerequisitesMarkdown')}
        onValidate={() => onValidate('prerequisitesMarkdown')}
      />
    </div>
  </React.Fragment>
);

DescriptionEditor.propTypes = {
  operator: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onValidate: PropTypes.func.isRequired
};

export default DescriptionEditor;
