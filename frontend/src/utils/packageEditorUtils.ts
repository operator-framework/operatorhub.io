import _ from "lodash";

import { UploadMetadata } from "../components/uploader";
import { createtUpload } from "../components/uploader/operator/UploaderUtils";
import { getUpdatedFormErrors } from "../pages/operatorBundlePage/bundlePageUtils";
import { sectionsFields, NEW_CRD_NAME } from "./constants";
import { Operator } from "./operatorTypes";
import { removeEmptyOptionalValuesFromOperator } from "./operatorValidation";
import { PackageEditorOperatorVersionCrdMetadata, PackageEditorOperatorVersionMetadata, PacakgeEditorChannel } from "./packageEditorTypes";


export const  validateChannel = (channel: PacakgeEditorChannel, versions: PackageEditorOperatorVersionMetadata[]) => channel.versions.every(version => {
    const versionMetadata = versions.find(versionMeta => versionMeta.version === version);
    return versionMetadata ? versionMetadata.valid : true;
});


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
        // remove default values from validation as they won't be exported so no point showing errors for them
        const cleanedCsv = removeEmptyOptionalValuesFromOperator(version.csv);
        const csvValid = validateOperator(cleanedCsv);
        const missingCrds = hasMissingCrds(cleanedCsv, version.crdUploads);
       
        const valid = csvValid && !missingCrds;     

        return {
            ...version,
            valid
        }
    });

    return validatedVersions;
}

const hasMissingCrds = (operator: Operator, crdUploads: PackageEditorOperatorVersionCrdMetadata[]) => {
    const missingCrds: any[] = _.get(operator, sectionsFields['owned-crds']).filter(
        crd => crd.name !== NEW_CRD_NAME && !crdUploads.map(crd => crd.name).includes(crd.name)
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

