import { NormalizedOperatorPackage, OperatorDetailChannelList, NormalizedOperator } from "../sharedTypes";

/**
 * Gets default oeprator in package if defined
 * @param operatorPackage 
 */
export const getDefaultOperatorForPackage = (operatorPackage: NormalizedOperatorPackage) => {
    const defaultChannel = operatorPackage.channelsList.find(channel => channel.name === operatorPackage.defaultChannelName);

    if (defaultChannel) {
        // ordering is done in descending way so fist operator is latest
        // however we can double check
        return defaultChannel.csvFiles.find(operator => operator.name === defaultChannel.latestCsvName) || defaultChannel.csvFiles[0];

    } else {
        console.error(`Cannot find default channel for package "${operatorPackage.name}"`);
        return null;
    }
};

const metadataCache = new Map<string, OperatorDetailChannelList[]>();

/**
 * Get list of channels and operator versions in package
 * Uses cache to reduce redundant work
 * @param operatorPackage 
 */
export function getChannelMetadataList(operatorPackage: NormalizedOperatorPackage) {
    const packageName = operatorPackage.name;

    // return from cache
    if (metadataCache.has(packageName)) {
        return metadataCache.get(packageName);

    } else {
        const packageChannelList = operatorPackage.channelsList.reduce((aggregator, channel) => {

            aggregator.push({
                name: channel.name,
                currentCSV: channel.latestCsvName,
                versions: channel.csvNamesList
            });

            return aggregator;
        }, [] as OperatorDetailChannelList[]);

        // add to cache
        metadataCache.set(packageName, packageChannelList);

        return packageChannelList;
    }
};

/**
 * Find operator in package based on details
 * @param operatorPackage 
 * @param channelName 
 * @param name 
 */
export function getOperator(operatorPackage: NormalizedOperatorPackage, channelName?: string, name?: string) {
    let operator: NormalizedOperator | null | undefined = null;

    if (channelName) {
        const operatorChannel = operatorPackage.channelsList.find(channel => channel.name === channelName);

        if (operatorChannel) {

            // find by name
            if (name) {
                operator = operatorChannel.csvFiles.find(csv => csv.name === name);

                !operator &&
                    console.warn(`No operator "${name}" in channel "${channelName}" of package "${operatorPackage.name}"`);

            // pick default in channel
            } else {
                operator = operatorChannel.csvFiles.find(csv => csv.name === operatorChannel.latestCsvName) || operatorChannel.csvFiles[0];
            }

        } else {
            console.warn(`No channel "${channelName}" for package "${operatorPackage.name}"`);
        }

    } else {
        operator = getDefaultOperatorForPackage(operatorPackage);
    }
    return operator;
}