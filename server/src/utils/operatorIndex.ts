
import {importData} from '../importer/client'

import { getDefaultOperatorForPackage } from './utils';
import { NormalizedOperatorPackage, OperatorIndexMetadata } from '../sharedTypes';

let operatorsIndexRaw: ReadonlyArray<NormalizedOperatorPackage>;
let operatorsIndex: OperatorIndexMetadata[];

export async function importDataAndPrepareForStartup(){
    operatorsIndexRaw = await importData();

    operatorsIndex = operatorsIndexRaw.map((operatorPackage): OperatorIndexMetadata | null => {
        const defaultOperator = getDefaultOperatorForPackage(operatorPackage);
    
        if (defaultOperator) {
            return {
                name: defaultOperator.name,
                displayName: defaultOperator.displayName,
                imgUrl: defaultOperator.thumbUrl,
                provider: defaultOperator.provider,
                capabilityLevel: defaultOperator.capabilityLevel,
                description: defaultOperator.description,
                categories: defaultOperator.categories,
                keywords: defaultOperator.keywords,
                packageName: defaultOperator.packageName
            }
        } else {
            console.error(`Minimal index builder > Cannot find default operator for package "${operatorPackage.name}"`);
        }
    
        return null;
    }).filter(operator => operator !== null) as OperatorIndexMetadata[];
}

export const getOperatorsData = () => operatorsIndexRaw;


export const getOperatorsIndex = () => operatorsIndex;
