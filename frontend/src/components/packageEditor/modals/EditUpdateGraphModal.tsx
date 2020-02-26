import React from 'react';
import { Modal } from 'patternfly-react';
import validRange from 'semver/ranges/valid';


import OperatorSelect from '../../editor/forms/OperatorSelect';
import { getVersionFromName } from '../../../utils/packageEditorUtils';
import { ExternalLink } from '../../ExternalLink';
import OperatorInputWrapper from '../../editor/forms/OperatorInputWrapper';

 
type FieldNames = 'replaces' | 'skips' | 'skipRange';

export interface EditUpgradeGraphModalProps {
  currentVersion: string
  versions: string[]
  replaces?: string
  skips?: string[]
  skipRange?: string
  onConfirm: (replaced: string, skips: string[], skipRange: string) => void
  onClose: () => void
}

interface EditUpgradeGraphModalState {
  replaces: string,
  skips: string[],
  skipRange: string,
  possibleReplaces: string[]
  possibleSkips: string[]
  validFields: Record<FieldNames, boolean>
  formErrors: Record<FieldNames, string | null>
}

class EditUpgradeGraphModal extends React.PureComponent<EditUpgradeGraphModalProps, EditUpgradeGraphModalState> {


  state: EditUpgradeGraphModalState = {
    replaces: '',
    skips: [],
    skipRange: '',
    possibleReplaces: [],
    possibleSkips: [],
    validFields: {
      replaces: true,
      skips: true,
      skipRange: true
    },
    formErrors: {
      replaces: null,
      skips: null,
      skipRange: null
    }
  };

  componentDidMount() {
    const { replaces, skips, skipRange, currentVersion, versions } = this.props;

    // get versions out of full names so we can order and compare them
    const derivedReplaces = replaces && getVersionFromName(replaces) || '';
    const derivedSkips = skips && skips.map(skip => getVersionFromName(skip)).filter(skip => skip !== null) as string[] || [];

    const currentVersionIndex = versions.indexOf(currentVersion);
    const possibleReplaces = versions.slice(currentVersionIndex + 1);

    const replacesIndex = derivedReplaces ? possibleReplaces.indexOf(derivedReplaces) : possibleReplaces.length;
    const possibleSkips = possibleReplaces.slice(0, Math.max(replacesIndex, 0));

    this.setState({
      replaces: derivedReplaces,
      skips: derivedSkips,
      skipRange: skipRange || '',
      possibleReplaces,
      possibleSkips
    })
  }


  descriptions: Record<FieldNames, React.ReactNode> = {
    replaces: 'Select the version of the CSV from a previous Operator Version that will be replaced by this Operator Version',
    skips: (
      <>
        Select the version of the CSV that will be skipped in the traverse of the Update Graph.
        The "skips" version has to be greater than the "replaces" version in&nbsp;
        <ExternalLink href="https://github.com/blang/semver#ranges" indicator>Semantic Versioning (semver library)</ExternalLink>.
      </>
    ),
    skipRange: (
      <>
        Specify the previous range of Operator Version that will be replaced by this Operator version.
        Use the version range format supported by the&nbsp;
        <ExternalLink href="https://github.com/blang/semver#ranges" indicator>semver library in Semantic Versioning</ExternalLink>.
      </>
    )

  }

  updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // @ts-ignore
    this.setState({ [name]: value });
  }

  updateReplacesField = (name: string, values: string[]) => {
    this.setState({ replaces: values[0] });
  }

  updateSkipsField = (name: string, values: string[]) => {
    // @ts-ignore
    this.setState({ skips: values });
  }

  validators = {
    // empty validator as there is nothing to check here
    replaces: (value: string) => null,
    skips: (value: string) => null,
    skipRange: (value: string) => {
      return validRange(value) ? null : 'Please use the valid semantic versioning range format.'
    }
  }


  commitField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    this.validateField(name, value);
  }

  commitReplacesField = (name: string) => {
    const { replaces, possibleReplaces } = this.state;

    const replacesIndex = replaces ? possibleReplaces.indexOf(replaces) : possibleReplaces.length;

    // reduce possible skips based on changed replaces version
    this.setState({
      possibleSkips: possibleReplaces.slice(0, replacesIndex)
    });

    this.validateField(name, replaces)
  }

  commitSelectField = (name: string) => {
    const value = this.state[name];

    this.validateField(name, value)
  }

  validateField = (name: string, value: string) => {
    const { formErrors, validFields } = this.state;

    const error = this.validators[name](value);

    this.setState({
      formErrors: {
        ...formErrors,
        [name]: error
      },
      validFields: {
        ...validFields,
        [name]: typeof error !== 'string'
      }
    });

    return error;
  }

  onConfirm = (e: React.MouseEvent) => {
    const { onConfirm } = this.props;
    const { replaces, skips, skipRange } = this.state;

    e.preventDefault();
    onConfirm(replaces, skips, skipRange);
  }

  render() {
    const { onClose } = this.props;
    const { replaces, skips, skipRange, formErrors, validFields, possibleReplaces, possibleSkips } = this.state;

    const allValid = Object.values(validFields).every(field => field);

    return (
      <Modal show onHide={onClose} bsSize="lg" className="oh-yaml-upload-modal right-side-modal-pf oh-operator-editor-page">
        <Modal.Header>
          <Modal.CloseButton onClick={onClose} />
          <Modal.Title>Edit Update Graph</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          {
            <form className="oh-operator-editor-form">
              <OperatorSelect
                title="Replaces (optional)"
                descriptions={this.descriptions}
                field="replaces"
                formErrors={formErrors}
                key="replaces"
                values={replaces ? [replaces] : []}
                options={possibleReplaces}
                isMulti={false}
                updateOperator={this.updateReplacesField}
                commitField={this.commitReplacesField}
                placeholder="Select Operator Version"
              />
              <OperatorSelect
                title="Skips (optional)"
                descriptions={this.descriptions}
                field="skips"
                formErrors={formErrors}
                key="skips"
                values={skips}
                options={possibleSkips}
                isMulti
                updateOperator={this.updateSkipsField}
                commitField={this.commitSelectField}
                placeholder="Select Operator Version"
              />
              <OperatorInputWrapper
                title="Skip Range (optional)"
                descriptions={this.descriptions}
                field="skipRange"
                formErrors={formErrors}
                key="skipRange"
              >
                <input
                  className="form-control"
                  name="skipRange"
                  type="text"
                  onChange={this.updateField}
                  onBlur={this.commitField}
                  placeholder="e.g. >=4.1.0 <4.2.0"
                  value={skipRange}
                />
              </OperatorInputWrapper>

            </form>
          }
        </Modal.Body>
        <Modal.Footer>
          <button className="oh-button oh-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="oh-button oh-button-primary" onClick={this.onConfirm} disabled={!allValid}>
            Save
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}



export default EditUpgradeGraphModal;
