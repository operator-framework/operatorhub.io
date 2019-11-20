import { GetPackageRequest, Package } from '../../proto/registry_pb';

import { registryService } from '../registryService';
import Logger from '../utils/logger';
import { ClientTransportError, OperatorPackage, RawPackages } from '../types';
import { getAllBundlesInChannel } from './getChannel';


/**
 * Fetches single package metadata
 * @param packageName 
 */
async function getPackage(packageName: string) {
    const ENDPOINT_NAME = 'GetPackage';

    return new Promise<Package.AsObject | null>(resolve => {

        const request = new GetPackageRequest();
        request.setName(packageName);

        registryService.getPackage(
            request,
            undefined as any,
            (err, packageData) => {
                if (err) {
                    const error: ClientTransportError = {
                        name: 'Unexpected stream error',
                        endpoint: ENDPOINT_NAME,
                        data: err
                    };

                    Logger.error(`[${ENDPOINT_NAME} - "${packageName}"] FAILED. SKIPPED PACKAGE `, error);
                    resolve(null);

                } else if (packageData) {
                    const pkg = packageData.toObject();

                    Logger.debug(`[${ENDPOINT_NAME}] Received package ${JSON.stringify(pkg)}`);
                    resolve(pkg);

                } else {
                    Logger.warn(`[${ENDPOINT_NAME} - "${packageName}] Received no data. SKIPPED PACKAGE.`);
                    resolve(null);
                }
            }
        )
    });
};


/**
 * Builds list of packages with metadata
 * @param packages 
 */
export async function getPackages(packages: string[]) {
    const ENDPOINT_NAME = 'GetPackages';

    const packageRequests = packages.reduce<Promise<(Package.AsObject | null)>[]>((aggregator, packageName) => {
        aggregator.push(getPackage(packageName));

        return aggregator;
    }, []);
    const packageSet: RawPackages = new Set();
    
    return Promise.all(packageRequests).then(packageList => {
        Logger.log(`${ENDPOINT_NAME} SUCCESS`);

        packageList.forEach(packageData => {
            packageData !== null && packageSet.add(packageData);            
        });
        return packageSet;

    }).catch(e => {
        Logger.error(`${ENDPOINT_NAME} collecting packages failed. Can't proceed.`, e);

        return packageSet;
    });
};

/**
 * Entry point for fetching bundles of single package
 * Build package metadata with all channel data and collect all bundles
 * @param packageFile 
 */
export async function getAllBundlesInPackage(packageFile: Package.AsObject) {
    const ENDPOINT_NAME = 'getAllBundlesInPackage';


    let packageWithBundles: OperatorPackage  = {
        name: packageFile.name,
        channelsList: packageFile.channelsList.map(channel => ({
            name: channel.name,
            latestCsvName: channel.csvname,
            csvNamesList: [],
            csvFiles: []
        })),
        defaultChannelName: packageFile.defaultchannelname
    };

    try{
        packageWithBundles = await getBundlesInPackageChannels(packageWithBundles, 0);
    } catch(e){
        Logger.error(`${ENDPOINT_NAME} failed to retreive package bundles for package ${packageFile.name}`, e);
    }
    
    return packageWithBundles;
}

/**
 * Recursively collects all bundles in all package channels and builds package channels metadata
 * @param packageData 
 * @param channelIndex 
 */
async function getBundlesInPackageChannels(packageData: OperatorPackage, channelIndex: number) {


    let channel = packageData.channelsList[channelIndex];
    const nextChannel = packageData.channelsList[channelIndex + 1];

    if(channel){
        const bundles = await getAllBundlesInChannel(packageData.name, channel.name, channel.latestCsvName);

        // add csv related data to channel
        packageData.channelsList[channelIndex] = {
            ...channel,
            csvFiles:  Array.from(bundles.values()), 
            csvNamesList: Array.from(bundles.entries()).map(entry => ({
                name: entry[0],
                version: entry[1].spec.version
            }))
        };
    }

    if(nextChannel){
        await getBundlesInPackageChannels(packageData, channelIndex + 1);
    }

    return packageData;
}
