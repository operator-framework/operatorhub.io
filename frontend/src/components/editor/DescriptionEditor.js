import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';

import { operatorFieldDescriptions } from '../../utils/operatorDescriptors';
import MarkdownEditor from './MarkdownEditor';

class DescriptionEditor extends React.Component {
  description = operatorFieldDescriptions.spec.description;

  render() {
    const { operator, formErrors, onUpdate, onValidate } = this.props;

    const aboutApplication = _.get(operator, 'spec.description.aboutApplication', '');
    const aboutOperator = _.get(operator, 'spec.description.aboutOperator', '');
    const prerequisites = _.get(operator, 'spec.description.prerequisites', '');

    const aboutApplicationError = _.get(formErrors, 'spec.description.aboutApplication');
    const aboutOperatorError = _.get(formErrors, 'spec.description.aboutOperator');
    const prerequisitesError = _.get(formErrors, 'spec.description.prerequisites');

    return (
      <React.Fragment>
        <h3>Description</h3>
        <p>{this.description}</p>
        <div className="oh-operator-editor-form__field-section">
          <MarkdownEditor
            title="Details about the managed application"
            description="Please describe the name, features, and use case(s) for your managed application briefly, and include links to read more about it."
            markdown={aboutApplication}
            validationError={aboutApplicationError}
            minHeadlineLevel
            onChange={markdown => onUpdate(markdown, 'spec.description.aboutApplication')}
            onValidate={() => onValidate('spec.description.aboutApplication')}
          />
          <MarkdownEditor
            title="Details about the Operator"
            description="Please describe the features your Operator provides to manage the application and what is it's value add."
            markdown={aboutOperator}
            validationError={aboutOperatorError}
            minHeadlineLevel
            onChange={markdown => onUpdate(markdown, 'spec.description.aboutOperator')}
            onValidate={() => onValidate('spec.description.aboutOperator')}
          />
          <MarkdownEditor
            title="Details the prerequisites for enabling the Operator"
            description="Please describe any steps a user needs to take prior to enabling this Operator (e.g. any Secrets or ConfigMaps that need to be in place upfront)."
            markdown={prerequisites}
            validationError={prerequisitesError}
            minHeadlineLevel
            onChange={markdown => onUpdate(markdown, 'spec.description.prerequisites')}
            onValidate={() => onValidate('spec.description.prerequisites')}
          />
        </div>
      </React.Fragment>
    );
  }
}

DescriptionEditor.propTypes = {
  operator: PropTypes.object.isRequired,
  formErrors: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  onValidate: PropTypes.func.isRequired
};

DescriptionEditor.defaultProps = {
  formErrors: {}
};

export default DescriptionEditor;
