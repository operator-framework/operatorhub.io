import _ from "lodash";

import { UploadMetadata } from "../components/uploader";
import { createtUpload } from "../components/uploader/operator/UploaderUtils";
import { getUpdatedFormErrors } from "../pages/operatorBundlePage/bundlePageUtils";
import { sectionsFields, NEW_CRD_NAME } from "./constants";
import { Operator } from "./operatorTypes";
import { removeEmptyOptionalValuesFromOperator } from "./operatorValidation";
import { PackageEditorOperatorVersionCrdMetadata, PackageEditorOperatorVersionMetadata } from "./packageEditorTypes";


export const convertVersionCrdsToVersionUploads = (versionCrdUploads: PackageEditorOperatorVersionCrdMetadata[]) => versionCrdUploads.map(
    upload => {
        const versionEditorUpload: UploadMetadata = {
            ...createtUpload(`${upload.name}.crd.yaml`),
            name: upload.name,
            data: upload.crd,
            status: 'Supported Object',
            type: 'CustomResourceDefinition'
        };

        return versionEditorUpload;
    }
);

export const validateOperatorVersions = (versions: PackageEditorOperatorVersionMetadata[]) => {
   
    const validatedVersions = versions.map(version => {
        const csvValid = validateOperator(version.csv);
        const missingCrds = hasMissingCrds(version);
       
        const valid = csvValid && !missingCrds;       

        return {
            ...version,
            valid
        }
    });

    return validatedVersions;
}

const hasMissingCrds = (version: PackageEditorOperatorVersionMetadata) => {
    const missingCrds: any[] = _.get(version.csv, sectionsFields['owned-crds']).filter(
        crd => crd.name !== NEW_CRD_NAME && !version.crdUploads.map(crd => crd.name).includes(crd.name)
    );

    return missingCrds.length > 0;
}

export const validateOperator = (operator: Operator) => {
    const cleanedOperator = removeEmptyOptionalValuesFromOperator(operator);

    let operatorIsValid = true;

    // iterate over sections to update its state so user see where errors happened
    Object.keys(sectionsFields).forEach(sectionName => {
        const fields = sectionsFields[sectionName];
        const sectionErrors = getUpdatedFormErrors(cleanedOperator, {}, fields);

        // check if some section field has error
        const sectionHasErrors = _.castArray(fields).some(field => _.get(sectionErrors, field));

        if (sectionHasErrors) {
            operatorIsValid = false;
        }
    });

    return operatorIsValid;
}

