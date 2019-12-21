import React from 'react';
import { Modal } from 'patternfly-react';

import { noop } from '../../../common/helpers';
import OperatorSelect from '../../editor/forms/OperatorSelect';


type FieldNames = 'replaces';

export interface UploadPackageFromGithubModalProps {

  onClose: () => void
}

interface UploadPackageFromGithubModalState {
  replaces: string,
  validFields: Record<FieldNames, boolean>
  formErrors: Record<FieldNames, string | null>  
}

class UploadPackageFromGithubModal extends React.PureComponent<UploadPackageFromGithubModalProps, UploadPackageFromGithubModalState> {


  state: UploadPackageFromGithubModalState = {
    replaces: '',
   
    validFields: {  
        replaces: true
    },
    formErrors: {
        replaces: null
    }    
  };

  descriptions: Record<FieldNames, string> = {
    replaces: 'Select the name of the CSV from a previous Operator Version that will be replaced by this Operator Version'
  }

  updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // @ts-ignore
    this.setState({ [name]: value });
  }

  updateSelectField = (name: string, value: string[]) => {
      console.log(name, value);

      // @ts-ignore
    this.setState({ [name]: value });
  }

  validators = {
    replaces: (value: string) => {
      return null;
    }    
  }


  commitField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
   
    this.validateField(name, value);
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

  
//   onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {

//     if ((event.which === 13 || event.keyCode === 13)) {
//         event.preventDefault();
//         const { name, value } = event.target as HTMLInputElement;

//         const validationResult = this.commitField(event as any);

//         if (validationResult === null) {
//           const {validFields} = this.state;

//           const allValid = Object.values(validFields).every(field => field);

//           allValid && this.upload();
//         }
//     }
// };

 


  render() {
    const { onClose } = this.props;
    const { replaces, formErrors, validFields } = this.state;

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
                values={[]}
                options={[]}
                isMulti
                updateOperator={this.updateSelectField}
                commitField={this.commitSelectField}
              />               
              {/* <OperatorInputWrapper
                title="Operator package path"
                descriptions={this.descriptions}
                field="path"
                formErrors={formErrors}
                key="path"
              >
                <input
                  className="form-control"
                  name="path"
                  type="text"
                  onFocus={this.closeNoResultsWarning}
                  onChange={this.updateField}
                  onBlur={this.commitField}
                  onKeyDown={this.onKeyDown}
                  placeholder="e.g. upstream-community-operators/etcd"
                  value={path}
                />
              </OperatorInputWrapper>
              <OperatorInputWrapper
                title="Branch"
                descriptions={this.descriptions}
                field="branch"
                formErrors={formErrors}
                key="branch"
              >
                <input
                  className="form-control"
                  name="branch"
                  type="text"
                  onFocus={this.closeNoResultsWarning}
                  onChange={this.updateField}
                  onBlur={this.commitField}
                  onKeyDown={this.onKeyDown}
                  placeholder="e.g. master"
                  value={branch}
                />
              </OperatorInputWrapper> */}
            </form>
          }          
        </Modal.Body>
        <Modal.Footer>
          <button className="oh-button oh-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="oh-button oh-button-primary" onClick={noop} disabled={true}>
            Save
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}



export default UploadPackageFromGithubModal;
