import {get} from "lodash";
import { Operator, OperatorCrd, OperatorInstallMode, OperatorOwnedCrd } from "./types";
import { AlmExample, NormalizedCrd } from "../../sharedTypes";
import Logger from "../utils/logger";

/**
 * Convert version into unified version string
 * @param version 
 */
export function normalizeVersion(version: string) {
    return version
        .split('.')
        .map(versionField => {

            if (versionField.indexOf('-') === -1) {
                return +versionField + 100000;
            }
            return versionField
                .split('-')
                .map(fieldPart => (isNaN(+fieldPart) ? fieldPart : +fieldPart + 100000))
                .join('-');
        })
        .join('.');
};

const validCapabilityStrings = ['Basic Install', 'Seamless Upgrades', 'Full Lifecycle', 'Deep Insights', 'Auto Pilot'];

/**
 * Normalize capability into one of supported names
 * @param capability 
 */
export const normalizeCapabilityLevel = (capability: string) => {
    if (validCapabilityStrings.includes(capability)) {
        return capability;
    }
    return validCapabilityStrings[0];
};


/**
 * Find matching ALM example for CRD
 * @param kind 
 * @param operator 
 */
const getExampleYAML = (kind: string, operator: Operator): AlmExample| null => {
    const examples: string = get(operator, 'metadata.annotations.alm-examples');

    if (examples) {
        try {
            const yamlExamples: any[] = JSON.parse(examples);
            return yamlExamples.find(example => example.kind === kind);

        } catch (e) {
            Logger.error(`getExampleYAML > failed to parse example for CRD ${kind}`, e);
        }
    }
    return null;
};

/**
 * Normalize single CRD
 * @param crd 
 * @param operator 
 */
function normalizeCRD(crd: OperatorCrd, operator: Operator): NormalizedCrd {
    return {
        name: crd.name || 'Name Not Available',
        kind: crd.kind,
        displayName: crd.displayName || 'Name Not Available',
        description: crd.description || 'No description available',
        yamlExample: getExampleYAML(crd.kind, operator)
    }
};

/**
 * Normalize all CRDs
 * @param operator 
 */
export const normalizeCRDs = (operator: Operator) => {
    const customResourceDefinitions: OperatorOwnedCrd[] = get(operator, 'spec.customresourcedefinitions.owned', []);
    return customResourceDefinitions.map(crd => normalizeCRD(crd, operator));
};

export const isGlobalOperator = (installModes: OperatorInstallMode[] = []) => installModes.some(mode => mode.type === 'AllNamespaces' && mode.supported);
