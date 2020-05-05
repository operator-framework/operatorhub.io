
import {importData} from '../importer/client'

import { getDefaultOperatorForPackage } from './utils';
import { NormalizedOperatorPackage, OperatorIndexMetadata } from '../sharedTypes';
import { loadOperators } from '../importer/legacy/loader';
import { USE_REGISTRY, REGISTRY_ADDRESS } from './constants';

let operatorsIndexRaw: ReadonlyArray<NormalizedOperatorPackage>;
let operatorsIndex: OperatorIndexMetadata[];
let ready = false;
let healthy = true;

export function getReadyState(){
    return ready;
}

export function getHealthState(){
    return healthy;
}

/**
 * Import data from registry in normalized format and preprocess operators index
 * and cache it
 */
export async function importDataAndPrepareForStartup(){

    // catch health state after import
    try{
        if(USE_REGISTRY){
            console.log(`Importing data from operator registry at address ${REGISTRY_ADDRESS}`);
            operatorsIndexRaw = await importData();
            
        } else {
            console.log('Parsing  data from local copy of communuity operators repo');
            operatorsIndexRaw = await loadOperators();
        }
        
    } catch(e){
        healthy = false;        
    }

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

    ready = true;
}

export const getOperatorsData = () => operatorsIndexRaw;


export const getOperatorsIndex = () => operatorsIndex;
