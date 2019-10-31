import { GetBundleInChannelRequest, Bundle, GetBundleRequest } from '../../proto/registry_pb';

import { registryService } from '../registryService';
import Logger from '../utils/logger';
import { ClientTransportError, OperatorsMap } from '../types';
import { Operator } from '../normalizer/types';

/**
 * Fetch latest bundle in channel
 * @param packageName 
 * @param channelName 
 */
export async function getLatestBundleInChannel(packageName: string, channelName: string) {

    const ENDPOINT_NAME = 'GetBundleInChannel';

    return new Promise<Bundle.AsObject | null>((resolve, reject) => {

        const req = new GetBundleInChannelRequest();
        req.setPkgname(packageName);
        req.setChannelname(channelName);

        registryService.getBundleForChannel(req, undefined as any, (err, response) => {

            if (err) {
                const error: ClientTransportError = {
                    name: 'Unexpected stream error',
                    endpoint: ENDPOINT_NAME,
                    data: err
                };

                Logger.error(`[${ENDPOINT_NAME} > ${packageName} - ${channelName}] FAILED.`, error);
                reject(error);

            } else if (response) {
                const bundle = response.toObject();

                Logger.debug(`[${ENDPOINT_NAME} > ${packageName} - ${channelName}] Received bundle ${bundle.csvname}`);

                resolve(bundle);
            // empty response
            } else {
                Logger.warn(`[${ENDPOINT_NAME} > ${packageName} - ${channelName}] Received no data.`);
                resolve(null);
            }
        })
    })
};

/**
 * Get bundle by bundle name in channel & package
 * @param packageName 
 * @param channelName 
 * @param csvName 
 */
async function getBundleByName(packageName: string, channelName: string, csvName: string) {

    const ENDPOINT_NAME = 'GetBundle';

    return new Promise<Bundle.AsObject | null>((resolve, reject) => {

        const req = new GetBundleRequest();
        req.setPkgname(packageName);
        req.setChannelname(channelName);
        req.setCsvname(csvName);

        registryService.getBundle(req, undefined as any, (err, response) => {
            if (err) {
                const error: ClientTransportError = {
                    name: 'Unexpected stream error',
                    endpoint: ENDPOINT_NAME,
                    data: err
                };

                Logger.error(`[${ENDPOINT_NAME} > ${packageName} - ${channelName}] FAILED.`, error);
                resolve(null);

            } else if (response) {
                const bundle = response.toObject();

                Logger.debug(`[${ENDPOINT_NAME} > ${packageName} - ${channelName}] Received bundle ${bundle.csvname}`);

                resolve(bundle);
            } else {
                Logger.warn(`[${ENDPOINT_NAME} > ${packageName} - ${channelName}] Received no data.`);
                resolve(null);
            }
        })
    })
};

/**
 * Recursively find previous versions of operator bundle this version replaces
 * @param bundlesMap 
 * @param packageName 
 * @param channelName 
 * @param replacedCsvName 
 */
export async function getReplacedBundles(bundlesMap: OperatorsMap, packageName: string, channelName: string, replacedCsvName: string) {

    const ENDPOINT_NAME = 'GetReplacedBundles';
    let latestBundle: Bundle.AsObject | null;
    let replacedBundleName: string | null = null;

    try {
        latestBundle = await getBundleByName(packageName, channelName, replacedCsvName);

        if (latestBundle !== null) {
            const csv: Operator = JSON.parse(latestBundle.csvjson);
            replacedBundleName = csv.spec.replaces;

            bundlesMap.set(latestBundle.csvname, csv);
        }

    } catch (e) {
        Logger.error(`[${ENDPOINT_NAME} > ${packageName} - ${replacedCsvName}] Failed with error. Can't find replaced bundles`, e);
    }

    if (replacedBundleName) {
        await getReplacedBundles(bundlesMap, packageName, channelName, replacedBundleName);
    }

    return bundlesMap;
}


