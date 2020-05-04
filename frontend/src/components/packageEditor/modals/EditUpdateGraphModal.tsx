import React from 'react';
import { Modal, Checkbox } from 'patternfly-react';
import validRange from 'semver/ranges/valid';


import OperatorSelect from '../../editor/forms/OperatorSelect';
import { getVersionFromName } from '../../../utils/packageEditorUtils';
import { ExternalLink } from '../../ExternalLink';
import OperatorInputWrapper from '../../editor/forms/OperatorInputWrapper';
import { pureVersionValidator } from '../../../utils/operatorValidators';
import { getValueError } from '../../../utils/operatorValidation';

export enum EditUpdateGraphModalMode {
    Add,
    Edit,
    Duplicate
}

type FieldNames = 'name' | 'replaces' | 'skips' | 'skipRange';

export interface EditUpgradeGraphModalProps {
    name?: string
    title: string
    mode: EditUpdateGraphModalMode
    currentVersion?: string
    versions: string[]
    replaces?: string
    skips?: string[]
    skipRange?: string
    onConfirm: (name: string, replaced: string, skips: string[], skipRange: string, useAsDefault: boolean) => void
    onClose: () => void
}

interface EditUpgradeGraphModalState {
    name?: string,
    replaces: string,
    skips: string[],
    skipRange: string,
    possibleReplaces: string[]
    possibleSkips: string[]
    validFields: Record<FieldNames, boolean>
    formErrors: Record<FieldNames, string | null>
    useAsDefault: boolean
}

class EditUpgradeGraphModal extends React.PureComponent<EditUpgradeGraphModalProps, EditUpgradeGraphModalState> {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            replaces: '',
            skips: [],
            skipRange: '',
            possibleReplaces: [],
            possibleSkips: [],
            validFields: {
                name: !props.name,
                replaces: true,
                skips: true,
                skipRange: true
            },
            formErrors: {
                name: null,
                replaces: null,
                skips: null,
                skipRange: null
            },
            useAsDefault: true
        };
    }

    componentDidMount() {
        const { name, mode, replaces, skips, skipRange, currentVersion, versions } = this.props;

        // get versions out of full names so we can order and compare them
        const derivedReplaces = replaces && getVersionFromName(replaces) || '';
        const derivedSkips = skips && skips.map(skip => getVersionFromName(skip)).filter(skip => skip !== null) as string[] || [];

        const currentVersionIndex = currentVersion && mode == EditUpdateGraphModalMode.Edit ? versions.indexOf(currentVersion) : -1;
        const possibleReplaces = versions.slice(currentVersionIndex + 1);

        const replacesIndex = derivedReplaces ? possibleReplaces.indexOf(derivedReplaces) : possibleReplaces.length;
        const possibleSkips = possibleReplaces.slice(0, Math.max(replacesIndex, 0));

        this.setState({
            name,
            replaces: derivedReplaces,
            skips: derivedSkips,
            skipRange: skipRange || '',
            possibleReplaces,
            possibleSkips
        });
    }


    descriptions: Record<FieldNames, React.ReactNode> = {
        name: 'The semantic version of the Operator. This value should be incremented each time a new Operator is published',
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

    };

    updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // @ts-ignore
        this.setState({ [name]: value });
    };

    updateReplacesField = (name: string, values: string[]) => {
        this.setState({ replaces: values[0] });
    };

    updateSkipsField = (name: string, values: string[]) => {
        // @ts-ignore
        this.setState({ skips: values });
    };

    validators = {
        // empty validator as there is nothing to check here
        name: (value: string) => {
            const valueError = getValueError(value, pureVersionValidator, {} as any);
            const { versions } = this.props;

            if (valueError) {
                return valueError;
            } else {
                return versions.includes(value) ? 'Version cannot match any other existing operator version.' : null;
            }
        },
        replaces: (value: string) => null,
        skips: (value: string) => null,
        skipRange: (value: string) => {
            return validRange(value) ? null : 'Please use the valid semantic versioning range format.';
        }
    };


    commitField = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        this.validateField(name, value);
    };

    commitReplacesField = (name: string) => {
        const { replaces, possibleReplaces } = this.state;

        const replacesIndex = replaces ? possibleReplaces.indexOf(replaces) : possibleReplaces.length;

        // reduce possible skips based on changed replaces version
        this.setState({
            possibleSkips: possibleReplaces.slice(0, replacesIndex)
        });

        this.validateField(name, replaces);
    };

    commitSelectField = (name: string) => {
        const value = this.state[name];

        this.validateField(name, value);
    };

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
    };

    onConfirm = (e: React.MouseEvent) => {
        const { onConfirm } = this.props;
        const { name, replaces, skips, skipRange, useAsDefault } = this.state;

        e.preventDefault();
        onConfirm(name || '', replaces, skips, skipRange, useAsDefault);
    };

    onNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const { onConfirm } = this.props;
        const { replaces, skips, skipRange, useAsDefault } = this.state;

        if ((event.which === 13 || event.keyCode === 13)) {
            event.preventDefault();
            const { name, value } = event.target as HTMLInputElement;

            const validationResult = this.validateField(name, value);

            if (validationResult === null) {
                onConfirm(value, replaces, skips, skipRange, useAsDefault);
            }
        }
    };

    useAsDefaultChanged = (e: any) => this.setState({
        useAsDefault: e.target.checked
    });

    render() {
        const { title, mode, onClose } = this.props;
        const { name = '', replaces, skips, skipRange, formErrors, validFields, possibleReplaces, possibleSkips, useAsDefault } = this.state;

        const allValid = Object.values(validFields).every(field => field);

        return (
            <Modal show onHide={onClose} bsSize="lg" className="oh-yaml-upload-modal right-side-modal-pf oh-operator-editor-page">
                <Modal.Header>
                    <Modal.CloseButton onClick={onClose}/>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form className="oh-operator-editor-form">
                        {
                            (mode == EditUpdateGraphModalMode.Add || mode == EditUpdateGraphModalMode.Duplicate) &&
                            <OperatorInputWrapper
                                title="Operator Version Name"
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
                                    onKeyDown={this.onNameKeyDown}
                                    placeholder="e.g. 1.2.3 or 1.0.0-beta1"
                                    value={name}
                                />
                            </OperatorInputWrapper>
                        }
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
                </Modal.Body>
                <Modal.Footer>
                    <div className="space-between">
                        <div>
                            {
                                (mode == EditUpdateGraphModalMode.Add || mode == EditUpdateGraphModalMode.Duplicate) &&
                                <Checkbox value={useAsDefault} onChange={this.useAsDefaultChanged} defaultChecked={useAsDefault}>
                                    Set as Default Version (current CSV)
                                </Checkbox>
                            }
                        </div>
                        <div>
                            <button className="oh-button oh-button-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button className="oh-button oh-button-primary" onClick={this.onConfirm} disabled={!allValid}>
                                Save
                            </button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    }
}


export default EditUpgradeGraphModal;
