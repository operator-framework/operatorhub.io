import React from 'react';
import { Modal } from 'patternfly-react';
import { simpleNameValidator } from '../../../utils/operatorValidators';
import { getValueError } from '../../../utils/operatorValidation';
import OperatorInputWrapper from '../../editor/forms/OperatorInputWrapper';


export interface EditChannelNameModalProps {
    name: string,
    onConfirm: (name: string, initialName: string) => void
    onClose: () => void
}

interface EditChannelNameModalState {
    name: string,
    validFields: {
        name: boolean
    }
    formErrors: {
        name: string | null
    }
}

class EditChannelNameModal extends React.PureComponent<EditChannelNameModalProps, EditChannelNameModalState> {


    state: EditChannelNameModalState = {
        name: '',
        validFields: {
            name: false
        },
        formErrors: {
            name: null
        }
    };

    componentDidMount() {
        const { name } = this.props;

        if (name !== this.state.name) {

            // we use original name to track creation of new channel and map which channel was edited
            this.setState(
                { name },
                () => this.validateField('name', name)
            );
        }
    }


    descriptions = {
        name: 'Channels allow you to specify different upgrade paths for different users. Name has to be unique per package.'
    }


    validators = {
        name: simpleNameValidator
    }

    updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // @ts-ignore
        this.setState({ [name]: value })
    }

    validateField = (name: string, value: string) => {
        const { formErrors, validFields } = this.state;

        const error = getValueError(value, this.validators[name], {} as any);

        this.setState({
            formErrors: {
                ...formErrors,
                [name]: error
            },
            validFields: {
                ...validFields,
                [name]: typeof error !== 'string'
            }
        })
    }

    commitField = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        this.validateField(name, value);
    }

    onConfirm = (e: React.MouseEvent) => {
        const { name: initialName, onConfirm } = this.props;
        const { name } = this.state;

        e.preventDefault();

        onConfirm(name, initialName);
    }

    render() {
        const { name: initialName, onClose } = this.props;
        const { formErrors, name, validFields } = this.state;

        const allValid = Object.values(validFields).every(field => field);

        return (
            <Modal show onHide={onClose} bsSize="lg" className="oh-yaml-upload-modal right-side-modal-pf oh-operator-editor-page">
                <Modal.Header>
                    <Modal.CloseButton onClick={onClose} />
                    <Modal.Title>{initialName ? 'Edit Package Channel Name' : 'Add Package Channel'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form className="oh-operator-editor-form">
                        <OperatorInputWrapper
                            title="Channel Name"
                            descriptions={this.descriptions}
                            field="name"
                            formErrors={formErrors}
                            key="name"
                        >
                            <input
                                className="form-control"
                                name="name"
                                type="text"
                                onChange={this.updateField}
                                onBlur={this.commitField}
                                placeholder="e.g. latest"
                                value={name}
                            />
                        </OperatorInputWrapper>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <button className="oh-button oh-button-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="oh-button oh-button-primary" onClick={this.onConfirm} disabled={!allValid}>
                        Confirm
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}



export default EditChannelNameModal;
