import Logger from './utils/logger';

import { listPackages } from './channels/listPackages';
import { getPackages, getAllBundlesInPackage } from './channels/getPackages';
import { normalizePackages } from './normalizer/converter';
import { RawPackages, Packages } from './types';
import { outputJSON } from 'fs-extra';
import { OUTPUT_PATH } from './constants';


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


(async function () {

    const PROCESSOR_NAME = 'CollectPackages';
    let packages: RawPackages = new Set();
    let packageMapWithChannels: Packages = new Set();

    try {
        const packageList = await listPackages();
        packages = await getPackages(packageList);
    } catch (e) {
        Logger.error(`[${PROCESSOR_NAME}] failed to get package list. No data to export.`);
        return;
    }

    if (packages.size > 0) {
        Logger.log(`[${PROCESSOR_NAME}] Contains ${packages.size} packages`);

        packageMapWithChannels = await collectPackageBundles(packages);

    } else {
        Logger.warn(`[${PROCESSOR_NAME}] Something went wrong and no packages are fetched. Existing.`);
        return;
    }

    // convert packages into desired output format for use in OperatorHub.io
    const normalizedPackages = await normalizePackages(packageMapWithChannels);

    try {
        await outputJSON(OUTPUT_PATH, normalizedPackages, { encoding: 'utf-8' });
        Logger.log('Created JSON file with processed operators metadata for website');

    } catch (e) {
        Logger.error('Failed creating JSON cache file with operator metadata.', e);

    } finally {
        console.log('Operators index created');
    } 

})();
