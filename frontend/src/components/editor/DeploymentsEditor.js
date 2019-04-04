import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import { safeLoad, safeDump } from 'js-yaml';
import { ExpandCollapse, Icon } from 'patternfly-react';
import YamlEditor from '../YamlViewer';

const deploymentsField = 'spec.install.spec.deployments';

class DeploymentsEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = { deployments: this.getOperatorDeployments() };
  }

  componentDidUpdate(prevProps) {
    const { operator } = this.props;
    if (operator !== prevProps.operator) {
      this.setState({ deployments: this.getOperatorDeployments() });
    }
  }

  createNewDeployment = () => ({
    error: '',
    deploymentObj: null,
    yaml: ''
  });

  getOperatorDeployments = () => {
    const { operator } = this.props;

    const currentDeployments = _.get(operator, deploymentsField, []).map(deploymentObj => {
      let yaml;
      let error;
      try {
        yaml = safeDump(deploymentObj);
        error = '';
      } catch (e) {
        yaml = '';
        error = e.message;
      }
      return { deploymentObj, yaml, error };
    });
    if (_.isEmpty(currentDeployments)) {
      currentDeployments.push(this.createNewDeployment);
    }

    return currentDeployments;
  };

  addOperatorDeployment = event => {
    const { deployments } = this.state;

    event.preventDefault();
    const newDeployments = [...deployments, {}];
    this.setState({ deployments: newDeployments });

    this.forceUpdate();
  };

  onYamlUpdate = deployment => {
    const { onUpdate } = this.props;
    const { deployments } = this.state;

    try {
      deployment.deploymentObj = safeLoad(deployment.yaml);
      deployment.error = '';
    } catch (e) {
      deployment.deploymentObj = null;
      deployment.error = e.message;
    }

    onUpdate(deployments);
  };

  onYamlChange = (deployment, yaml) => {
    deployment.yaml = yaml;
    this.forceUpdate();
  };

  removeOperatorDeployment = (event, deployment) => {
    const { onUpdate } = this.props;
    const { deployments } = this.state;

    event.preventDefault();

    const updatedDeployments = deployments.filter(nextDeployment => nextDeployment !== deployment);
    this.setState({ deployments: updatedDeployments });
    onUpdate(updatedDeployments);
  };

  renderDeployment = (deployment, index, allowRemove) => (
    <div key={index} className="oh-operator-editor-deployment">
      <YamlEditor
        onChange={yaml => this.onYamlChange(deployment, yaml)}
        editable
        yaml={deployment.yaml}
        error={deployment.error}
        allowClear={!allowRemove}
        showRemove={allowRemove}
        onRemove={e => this.removeOperatorDeployment(e, deployment)}
      />
    </div>
  );

  render() {
    const { deployments } = this.state;
    const allowRemove = _.size(deployments) > 1;

    return (
      <YamlEditor editable initYaml={deploymentYaml} />
    );
  }
}

DeploymentsEditor.propTypes = {
  operator: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default DeploymentsEditor;
