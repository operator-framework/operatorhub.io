import React from 'react';
import { Modal } from 'patternfly-react';
import { simpleNameValidator } from '../../../utils/operatorValidators';
import OperatorInputWrapper from '../../editor/forms/OperatorInputWrapper';


export interface EditNameInChannelModalProps {
    name: string,
    headline: string,

    nameFieldTitle: string,
    nameFieldDescription: string,
    nameFieldPlaceholder: string,

    nameValidator: (name: string) => any

    onConfirm: (name: string, initialName: string) => void
    onClose: () => void
}

interface EditNameInChannelModalState {
    name: string,
    validFields: {
        name: boolean
    }
    formErrors: {
        name: string | null
    }
}

class EditNameInChannelModal extends React.PureComponent<EditNameInChannelModalProps, EditNameInChannelModalState> {


    state: EditNameInChannelModalState = {
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
            this.setState({ name });
        }
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
        const { nameValidator } = this.props
        const { formErrors, validFields } = this.state;

        const error = nameValidator(value);

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

    commitField = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        this.validateField(name, value);
    }

    onConfirm = (e: React.MouseEvent) => {
        const { name: initialName, onConfirm } = this.props;
        const { name } = this.state;

        e.preventDefault();

        const validationResult = this.validateField('name', name);

        if(validationResult === null){
            onConfirm(name, initialName);
        }
    }

    render() {
        const { headline, nameFieldTitle, nameFieldDescription, nameFieldPlaceholder, onClose } = this.props;
        const { formErrors, name, validFields } = this.state;

        const allValid = Object.values(validFields).every(field => field);

        return (
            <Modal show onHide={onClose} bsSize="lg" className="oh-yaml-upload-modal right-side-modal-pf oh-operator-editor-page">
                <Modal.Header>
                    <Modal.CloseButton onClick={onClose} />
                    <Modal.Title>{headline}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form className="oh-operator-editor-form">
                        <OperatorInputWrapper
                            title={nameFieldTitle}
                            descriptions={{ name: nameFieldDescription }}
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
                                placeholder={nameFieldPlaceholder}
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

export default EditNameInChannelModal;
