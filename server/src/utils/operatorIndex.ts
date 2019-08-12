
import { operatorIndexPath } from '../utils/constants';
import { getDefaultOperatorForPackage } from './utils';
import { NormalizedOperatorPackage, OperatorIndexMetadata } from '../../../types/shared';

const operatorsIndexRaw: ReadonlyArray<NormalizedOperatorPackage> = require(operatorIndexPath);

export const operatorsData = operatorsIndexRaw;

export const operatorsIndex = operatorsIndexRaw.map((operatorPackage): OperatorIndexMetadata | null => {
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
