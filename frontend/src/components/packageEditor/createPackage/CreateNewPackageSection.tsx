import React from 'react';

import OperatorInputWrapper from '../../editor/forms/OperatorInputWrapper';
import { validateOperatorPackageField, getValueError } from '../../../utils/operatorValidation';
import _ from 'lodash';
import {  pureVersionValidator } from '../../../utils/operatorValidators';

export interface CreateNewOperatorPackageSectionProps {
    onSectionValidatedCallback: (isValid: boolean) => void
}

interface CreateNewOperatorPackageSectionState {
    packageName: string
    packageNameValid: boolean
    operatorVersion: string
    operatorVersionValid: boolean
    defaultChannel: string
    defaultChannelValid: boolean
    formErrors: any
}

class CreateNewOperatorPackageSection extends React.PureComponent<CreateNewOperatorPackageSectionProps, CreateNewOperatorPackageSectionState>{

    defaultState = {
        packageName: '',
        packageNameValid: false,
        operatorVersion: '',
        operatorVersionValid: false,
        defaultChannel: 'stable',
        defaultChannelValid: true,
        formErrors: {}
    };

    state: CreateNewOperatorPackageSectionState = this.defaultState;

    descriptions = {
        packageName: 'The name that describes your Operator.',
        operatorVersion: 'The semantic version of the Operator. This value should be incremented each time a new Operator is published',
        defaultChannel: 'Channels allow you to specify different upgrade paths for different users (e.g. alpha vs. stable).'
    }

    clearForm = () => {
        const { onSectionValidatedCallback } = this.props;

        this.setState(
            this.defaultState,
            () => {
                onSectionValidatedCallback(false);
            }
        );
    }

    commitField = (field: string, value: string) => {
        const { onSectionValidatedCallback } = this.props;
        const { formErrors } = this.state;

        // pick which validator to use
        let error: string | null = field === 'operatorVersion' ? this.validateVersion(value) : this.validateChannelAndPackage(value);

        // @ts-ignore
        this.setState({
            formErrors: {
                ...formErrors,
                [field]: error
            },
            [field + 'Valid']: typeof error !== 'string'

        }, () => {
            const { packageNameValid, operatorVersionValid, defaultChannelValid } = this.state;
            const isValid = defaultChannelValid && operatorVersionValid && packageNameValid;
            onSectionValidatedCallback(isValid);
        });
    }

    // reused package name validation as we follow same rules here
    validateChannelAndPackage = (value: string) => validateOperatorPackageField(value, 'name');

    // reused package name validation as we follow same rules here
    validateVersion = (value: string) => getValueError(value, pureVersionValidator, {} as any);

    updateField = (field: string, value: string) => {
        // @ts-ignore
        this.setState({ [field]: value });
    };



    render() {
        const { defaultChannel, packageName, operatorVersion, formErrors } = this.state;

        return (
            <div className="oh-operator-editor-form__field-section">
                <form className="oh-operator-editor-form">
                    <OperatorInputWrapper
                        title="Package Name"
                        descriptions={this.descriptions}
                        field="packageName"
                        formErrors={formErrors}
                        key="packageName"
                    >
                        <input
                            id="packageName"
                            className="form-control"
                            type="text"
                            onBlur={e => this.commitField('packageName', e.target.value)}
                            onChange={e => this.updateField('packageName', e.target.value)}
                            placeholder="e.g. knative-eventing-operator or couchbase-enterprise"
                            value={packageName}
                        />
                    </OperatorInputWrapper>
                    <OperatorInputWrapper
                        title="Operator Version"
                        descriptions={this.descriptions}
                        field="operatorVersion"
                        formErrors={formErrors}
                        key="operatorVersion"
                    >
                        <input
                            id="operatorVersion"
                            className="form-control"
                            type="text"
                            onBlur={e => this.commitField('operatorVersion', e.target.value)}
                            onChange={e => this.updateField('operatorVersion', e.target.value)}
                            placeholder="e.g. 0.0.1 or 1.0.0-rc2"
                            value={operatorVersion}
                        />
                    </OperatorInputWrapper>
                    <OperatorInputWrapper
                        title="Default Channel Name"
                        descriptions={this.descriptions}
                        field="defaultChannel"
                        formErrors={formErrors}
                        key="defaultChannel"
                    >
                        <input
                            id="defaultChannel"
                            className="form-control"
                            type="text"
                            onBlur={e => this.commitField('defaultChannel', e.target.value)}
                            onChange={e => this.updateField('defaultChannel', e.target.value)}
                            placeholder="e.g. stable"
                            value={defaultChannel}
                        />
                    </OperatorInputWrapper>
                </form>
            </div>
        )
    }
}

export default CreateNewOperatorPackageSection;