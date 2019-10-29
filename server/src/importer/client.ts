import { outputJSON } from 'fs-extra';

import Logger from './utils/logger';
import { listPackages } from './channels/listPackages';
import { getPackages, getAllBundlesInPackage } from './channels/getPackages';
import { normalizePackages } from './normalizer/converter';
import { RawPackages, Packages } from './types';
import { NormalizedOperatorPackage } from '../sharedTypes';
import { closeClient } from './registryService';


/**
 * Gathers raw packages data before processing them to output format
 * @param packageSet 
 */
async function collectPackageBundles(packageSet: RawPackages) {

    const PROCESSOR_NAME = 'CollectBundles';

    const packageMapWithChannels: Packages = new Set();
    const packages = packageSet.values();
    let currentPackage = packages.next();

    while (!currentPackage.done) {

        const packageWithChannels = await getAllBundlesInPackage(currentPackage.value);

        packageMapWithChannels.add(packageWithChannels);
        currentPackage = packages.next();
    }

    Logger.log(`[${PROCESSOR_NAME}] Contains ${packageSet.size} packages`);
    return packageMapWithChannels;
}

/**
 * Fetch data from registry and convert them to desired internal format
 */
export async function importData() {

    const PROCESSOR_NAME = 'CollectPackages';
    const timerStart = Date.now();

    let packages: RawPackages = new Set();
    let packageMapWithChannels: Packages = new Set();

    try {
        const packageList = await listPackages();
        packages = await getPackages(packageList);
    } catch (e) {
        Logger.error(`[${PROCESSOR_NAME}] failed to get package list. No data to export.`);
        closeClient();

        throw Error('Failed to get package list');
    }

    if (packages.size > 0) {
        Logger.log(`[${PROCESSOR_NAME}] Contains ${packages.size} packages`);

        packageMapWithChannels = await collectPackageBundles(packages);

    } else {
        Logger.error(`[${PROCESSOR_NAME}] Something went wrong and no packages are fetched.`);
        closeClient();

        throw Error('Failed to fetch packages');
    }

    let normalizedPackages: NormalizedOperatorPackage[] ;

    try{
        // convert packages into desired output format for use in OperatorHub.io
        normalizedPackages = await normalizePackages(packageMapWithChannels);

    } catch(e){
        Logger.error(`[${PROCESSOR_NAME}] Something went wrong while normalizing packages.`);
        closeClient();

        throw Error('Failed to normalize packages');
    }

    try {
        await outputJSON('./cache/operators.json', normalizedPackages, { encoding: 'utf-8' });
        Logger.log('Created JSON file with processed operators metadata for website');

    } catch (e) {
        Logger.error('Failed creating JSON cache file with operator metadata.', e);

    } finally {
        console.log(`Operators index created in ${Date.now() - timerStart} ms`);
        closeClient();
    }
    
    return normalizedPackages;
};
