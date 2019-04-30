import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';

import { operatorFieldDescriptions } from '../../utils/operatorDescriptors';
import { OPERATOR_DESCRIPTION_ABOUT_HEADER, OPERATOR_DESCRIPTION_PREREQUISITES_HEADER } from '../../utils/contants';
import MarkdownEditor from './MarkdownEditor';


class DescriptionEditor extends React.Component {

  state = {
    application: '',
    about: '',
    prerequisites: '',
    applicationError: null,
    aboutError: null,
    prerequisitesError: null
  };

  static getDerivedStateFromProps(props) {
    const markdown = DescriptionEditor.splitDescriptionIntoSections(props.operator);
    const errors = {
      applicationError: DescriptionEditor.validateMarkdown(markdown.application),
      aboutError: DescriptionEditor.validateMarkdown(markdown.about),
      prerequisitesError: DescriptionEditor.validateMarkdown(markdown.prerequisites)
    };

    return {
      ...markdown,
      ...errors
    };
  }

  static splitDescriptionIntoSections(operator) {
    const description = _.get(operator, 'spec.description', '');
    let application = description;
    let about = '';
    let prerequisites = '';

    const aboutHeaderIndex = description.indexOf(OPERATOR_DESCRIPTION_ABOUT_HEADER);
    const prerequisitesHeaderIndex = description.indexOf(OPERATOR_DESCRIPTION_PREREQUISITES_HEADER);

    // if we can identify headers, split using them
    // at least one header must be available
    if (aboutHeaderIndex > -1) {
      if (prerequisitesHeaderIndex > -1) {
        about = description.substring(aboutHeaderIndex, prerequisitesHeaderIndex);
        prerequisites = description.substring(prerequisitesHeaderIndex);
      } else {
        about = description.substring(aboutHeaderIndex);
      }

      application = description.substring(0, aboutHeaderIndex);
    } else if (prerequisitesHeaderIndex > -1) {
      application = description.substring(0, prerequisitesHeaderIndex);
      prerequisites = description.substring(prerequisitesHeaderIndex);

      // no our headers found, trying to match using level 2 headers
    } else {
      // contains splitted sections and headers using capture group inbetween splitted sections
      const segments = description.split(/(## [^\r?\n]+)/);

      // we put majority of the sections into first part

      // we have at least 3 headlines
      if (segments.length >= 7) {
        prerequisites = segments.slice(segments.length - 2).join('');
        about = segments.slice(segments.length - 4, segments.length - 2).join('');
        application = segments.slice(0, segments.length - 4).join('');

        // at least 2 headlines
      } else if (segments.length >= 5) {
        about = segments.slice(segments.length - 2).join('');
        application = segments.slice(0, segments.length - 2).join('');
      }
    }

    return {
      application,
      about,
      prerequisites
    };
  }

  static validateMarkdown(markdown) {
    const containsH1 = /(^# [^\r?\n]+)/m.test(markdown);

    return containsH1
      ? 'Heading level 1 is discouraged in the description as it collides with the rest of the page. Please use heading level 2 or higher.'
      : null;
  }

  onUpdate = (type, markdown) => {
    const { onUpdate } = this.props;
    const { about, application, prerequisites } = this.state;

    if (['application', 'about', 'prerequisites'].includes(type)) {
      this.setState({
        [type]: markdown
      });

      const description = {
        application,
        about,
        prerequisites,
        [type]: markdown
      };

      // add trailing line break if is missing
      const descriptioText = Object.values(description).reduce(
        (aggregator, value) => aggregator + (value.endsWith('\n') ? value : `${value}\n`),
        ''
      );

      onUpdate(descriptioText, 'spec.description');
    } else {
      console.warn('Wrong type use correct one, cannot update');
    }
  };

  validate = type => {
    const { onValidate } = this.props;
    const markdown = this.state[type];

    this.setState({
      [`${type}Error`]: DescriptionEditor.validateMarkdown(markdown)
    });

    onValidate('spec.description');
  };

  render() {
    const {
      about, application, prerequisites, aboutError, applicationError, prerequisitesError
    } = this.state;

    return (
      <React.Fragment>
        <h3>Description</h3>
        <p>{operatorFieldDescriptions.spec.description}</p>
        <div className="oh-operator-editor-form__field-section">
          <MarkdownEditor
            title="Details about the managed application"
            description="Please describe the name, features, and use case(s) for your managed application briefly, and include links to read more about it."
            markdown={application}
            validationError={applicationError}
            minHeadlineLevel
            onChange={markdown => this.onUpdate('application', markdown)}
            onValidate={() => this.validate('application')}
          />
          <MarkdownEditor
            title="Details about the Operator"
            description="Please describe the features your Operator provides to manage the application and what is it's value add."
            markdown={about}
            validationError={aboutError}
            minHeadlineLevel
            onChange={markdown => this.onUpdate('about', markdown)}
            onValidate={() => this.validate('about')}
          />
          <MarkdownEditor
            title="Details the prerequisites for enabling the Operator"
            description="Please describe any steps a user needs to take prior to enabling this Operator (e.g. any Secrets or ConfigMaps that need to be in place upfront)."
            markdown={prerequisites}
            validationError={prerequisitesError}
            minHeadlineLevel
            onChange={markdown => this.onUpdate('prerequisites', markdown)}
            onValidate={() => this.validate('prerequisites')}
          />
        </div>
      </React.Fragment>
    );
  }
}


DescriptionEditor.propTypes = {
  operator: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onValidate: PropTypes.func.isRequired,
  formErrors: PropTypes.object
};

DescriptionEditor.defaultProps = {
  formErrors: {}
};

export default DescriptionEditor;
