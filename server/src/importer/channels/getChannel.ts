import Logger from '../utils/logger';
import {  getReplacedBundles } from './getBundle';
import { OperatorsMap } from '../types';

/**
 * Find and collect all versions of operator in channel as map
 * Insertion order is from most recent to older versions  
 * @param packageName 
 * @param channelName 
 * @param latestCsvName 
 */
export async function getAllBundlesInChannel(packageName: string, channelName: string, latestCsvName: string) {

    const ENDPOINT_NAME = 'GetAlldBundlesInChannel';

    let bundlesInChannelMap: OperatorsMap = new Map();

    if (latestCsvName) {
        bundlesInChannelMap = await getReplacedBundles(bundlesInChannelMap, packageName, channelName, latestCsvName);

        if (bundlesInChannelMap.size === 1) {
            Logger.log(`[${ENDPOINT_NAME} > ${packageName} - ${channelName}] contains single bundle`, Array.from(bundlesInChannelMap.keys()));

        } else {
            Logger.log(`[${ENDPOINT_NAME} > ${packageName} - ${channelName}] contains these bundles`, Array.from(bundlesInChannelMap.keys()));
        }
    }

    return bundlesInChannelMap;
};
