import _ from "lodash";
import JSZip from 'jszip';

import { UploadMetadata } from "../components/uploader";
import { createtUpload } from "../components/uploader/operator/UploaderUtils";
import { getUpdatedFormErrors, yamlFromOperator } from "../pages/operatorBundlePage/bundlePageUtils";
import { sectionsFields, NEW_CRD_NAME } from "./constants";
import { Operator } from "./operatorTypes";
import { removeEmptyOptionalValuesFromOperator } from "./operatorValidation";
import { PackageEditorOperatorVersionCrdMetadata, PackageEditorOperatorVersionMetadata, PacakgeEditorChannel } from "./packageEditorTypes";
import { safeDump } from 'js-yaml';

export const validateChannel = (channel: PacakgeEditorChannel, versions: PackageEditorOperatorVersionMetadata[]) => channel.versions.every(version => {
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

export const convertVersionCsvToVersionUpload = (version: PackageEditorOperatorVersionMetadata) => {
    const versionEditorUpload: UploadMetadata = {
        ...createtUpload(`${version.name}.csv.yaml`),
        name: version.name,
        data: version.csv,
        status: 'Supported Object',
        type: 'ClusterServiceVersion'
    };

    return versionEditorUpload;
};


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

export const buildVersionNameFromOperator = (operatorVersion: Operator, namePatternWithV: boolean) => {
    const name: string = _.get(operatorVersion, 'metadata.name');
    const version: string = _.get(operatorVersion, 'spec.version');

    return buildVersionName(name, version, namePatternWithV);
}

export const buildVersionName = (name: string, version: string, namePatternWithV: boolean) => {
    return namePatternWithV ? `${name}.v${version}` : `${name}.${version}`;
}

export const getVersionFromName = (fullName: string) => {
    let versionStart = fullName.indexOf('.v') + 2;

    // recover from case that no "".v" is present just version number!  
    const match = fullName.match(/\.[0-9]+\.[0-9]+\.[0-9]+/);

    if (match && typeof match.index === 'number') {
        versionStart = match.index + 1
    }

    if (versionStart > -1) {
        return fullName.slice(versionStart);
    } else {
        return null;
    }
}

export const createPackageBundle = (
    packageName: string,
    channels: PacakgeEditorChannel[],
    versions: PackageEditorOperatorVersionMetadata[],
    showMissingDefaultChannelConfirmationModal: () => any,
    generateAction: HTMLAnchorElement | null) => {
    const haveDefaultChannel = channels.some(channel => channel.isDefault) || channels.length === 1;

    if (!haveDefaultChannel) {
        showMissingDefaultChannelConfirmationModal();
        return;
    }

    const zip = new JSZip();

    const defaultChannel = channels.find(channel => channel.isDefault) || channels[0];
    const packageFileObject = {
        packageName,
        defaultChannel: defaultChannel.name,
        channels: channels.map(channel => ({
            name: channel.name,
            currentCSV: channel.currentVersionFullName
        }))
    };
    const pkgFolder = zip.folder(packageName);
    pkgFolder.file(`${packageName}.package.yaml`, safeDump(packageFileObject));

    versions.forEach(operatorVersion => {
        const versionFolder = pkgFolder.folder(operatorVersion.version);

        // remove values which are part of default operator, but are invalid
        const cleanedOperator = removeEmptyOptionalValuesFromOperator(operatorVersion.csv);

        let operatorYaml = '';
        try {
            operatorYaml = yamlFromOperator(cleanedOperator);
        } catch (e) {
            console.error('Failed to serialize operator csv.', e);
        }
        versionFolder.file(`${operatorVersion.name}.clusterserviceversion.yaml`, operatorYaml);

        // add CRDs
        operatorVersion.crdUploads.forEach(crd => {
            let crdYaml = '';
            let crdName = '';

            try {
                crdYaml = safeDump(crd.crd);
                crdName = crd.name;
            } catch (e) {
                console.warn(`Can't convert crd to yaml for ${crdName} of version ${operatorVersion.version}`);
            }

            versionFolder.file(`${crdName}.crd.yaml`, crdYaml);
        });
    });


    zip.generateAsync({ type: 'base64' }).then(
        base64 => {
            if (generateAction) {
                generateAction.href = `data:application/zip;base64,${base64}`;
                generateAction.download = `${packageName}.zip`;
                generateAction.click();
            } else {
                console.error('Something went wrong with download. Please retry.');
            }
        },
        err => {
            console.error(err);
        }
    );

}
