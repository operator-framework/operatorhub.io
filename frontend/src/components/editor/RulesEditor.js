import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import classNames from 'classnames';
import { Icon } from 'patternfly-react';
import EditorSelect from './EditorSelect';

const RESOURCES = [
  '*',
  'bindings',
  'configmaps',
  'endpoints',
  'events',
  'limitranges',
  'namespaces',
  'persistentvolumeclaims',
  'pods',
  'pods/attach',
  'pods/exec',
  'pods/log',
  'pods/portforward',
  'pods/proxy',
  'pods/status',
  'replicationcontrollers',
  'replicationcontrollers/scale',
  'secrets',
  'serviceaccounts',
  'services',
  'services/roxy'
];

const VERBS = ['*', 'create', 'delete', 'deletecollection', 'get', 'list', 'patch', 'update', 'watch'];

class RulesEditor extends React.Component {
  state = {
    rules: []
  };

  componentDidUpdate(prevProps) {
    const { permission } = this.props;

    if (permission !== prevProps.permission) {
      const rules = _.get(permission, 'rules', []);
      if (_.isEmpty(rules)) {
        rules.push({ apiGroups: '', resources: [], verbs: [] });
      }
      this.setState({ rules });
    }
  }

  componentDidMount() {
    const { permission } = this.props;

    const rules = _.get(permission, 'rules', []);
    if (_.isEmpty(rules)) {
      rules.push({ apiGroups: '', resources: [], verbs: [] });
    }
    this.setState({ rules });
  }

  areRulesEmpty = () => {
    const { rules } = this.state;

    return (
      rules.length <= 1 && rules[0].apiGroups === '' && rules[0].resources.length === 0 && rules[0].verbs.length === 0
    );
  };

  addRule = event => {
    const { rules } = this.state;

    event.preventDefault();
    this.setState({ rules: [...rules, { apiGroups: '', resources: [], verbs: [] }] });
  };

  updateRule = (rule, field, value) => {
    _.set(rule, field, value);
    this.forceUpdate();
  };

  updateRuleSelections = (rule, field, selections) => {
    // wildcard can be the only entry if selected, on add of wildcard remove the others, on add of anything else remove the wildcard
    if (selections.includes('*') && selections.length > 1) {
      const prevSelections = _.get(rule, field);
      if (prevSelections.includes('*')) {
        this.updateRule(rule, field, _.filter(selections, selection => selection !== '*'));
        return;
      }
      this.updateRule(rule, field, _.filter(selections, selection => selection === '*'));
      return;
    }

    this.updateRule(rule, field, selections);
  };

  onFieldBlur = rule => {
    const { onUpdate } = this.props;
    const { rules } = this.state;

    if (rule.apiGroups && _.size(rule.resources) && _.size(rule.verbs)) {
      onUpdate(rules);
    }
  };

  removeRule = (event, rule) => {
    const { onUpdate } = this.props;
    const { rules } = this.state;

    event.preventDefault();

    if (!this.areRulesEmpty()) {
      const newRules = rules.filter(nextRule => nextRule !== rule);
      if (_.isEmpty(newRules)) {
        newRules.push({ apiGroups: '', resources: [], verbs: [] });
      }

      this.setState({ rules: newRules });
      onUpdate(newRules);
    }
  };

  renderRule = (rule, index) => {
    const removeRuleClass = classNames('remove-label', { disabled: this.areRulesEmpty() });

    return (
      <div key={index} className="oh-operator-editor-form__field row">
        <div className="form-group col-sm-4">
          <input
            className="form-control"
            type="text"
            value={rule.apiGroups}
            onChange={e => this.updateRule(rule, 'apiGroups', e.target.value)}
            onBlur={() => this.onFieldBlur(rule)}
            placeholder={`e.g. ""`}
          />
        </div>
        <div className="form-group col-sm-4">
          <EditorSelect
            id="resource-select"
            values={_.get(rule, 'resources')}
            options={RESOURCES}
            clearButton
            customSelect
            placeholder="Select resources"
            onChange={(selections, e) => this.updateRuleSelections(rule, 'resources', selections)}
            onBlur={() => this.onFieldBlur(rule)}
            dropup
          />
        </div>
        <div className="col-sm-4">
          <div className="form-group oh-operator-editor-form__rule-verb-col">
            <EditorSelect
              id="verbs-select"
              values={_.get(rule, 'verbs')}
              options={VERBS}
              clearButton
              placeholder="Select verbs"
              onChange={(selections, e) => this.updateRuleSelections(rule, 'verbs', selections)}
              onBlur={() => this.onFieldBlur(rule)}
              dropup
            />
            <a href="#" className={removeRuleClass} onClick={e => this.removeRule(e, rule)}>
              <Icon type="fa" name="trash" />
              <span className="sr-only">Remove Rule</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { rules } = this.state;

    return (
      <React.Fragment>
        <div className="oh-operator-editor-form__field row">
          <span className="col-sm-4">apiGroups</span>
          <span className="col-sm-4">Resources</span>
          <span className="col-sm-4">Verbs</span>
        </div>
        {_.map(rules, (rule, index) => this.renderRule(rule, index))}
        <div className="oh-operator-editor__list__adder">
          <a href="#" className="oh-operator-editor-form__label-adder" onClick={e => this.addRule(e)}>
            <Icon type="fa" name="plus-circle" />
            <span>Add Rule</span>
          </a>
        </div>
      </React.Fragment>
    );
  }
}

RulesEditor.propTypes = {
  permission: PropTypes.object,
  onUpdate: PropTypes.func.isRequired
};

RulesEditor.defaultProps = {
  permission: {}
};

export default RulesEditor;
