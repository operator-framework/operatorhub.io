import { ListPackageRequest } from '../../proto/registry_pb';

import { registryService } from '../registryService';
import Logger from '../utils/logger';
import { ClientTransportError } from '../types';


/**
 * Fetches list of package names
 */
export async function listPackages() {
    const ENDPOINT_NAME = 'ListPackages';

    return new Promise<string[]>((resolve, reject) => {
        const packageList: string[] = [];

        registryService.listPackages(new ListPackageRequest())
            .on('data', response => {

                const pkg = response.toObject();
                packageList.push(pkg.name);

                Logger.debug(`[${ENDPOINT_NAME}] Received package name ${pkg.name}`);
            })
            .on('status', status => {

                if (status.code === 0) {

                    Logger.log(`${ENDPOINT_NAME} SUCCESS`);
                    resolve(packageList);

                } else {
                    const error: ClientTransportError = {
                        name: 'Unexpected stream status',
                        endpoint: ENDPOINT_NAME,
                        data: status
                    };

                    Logger.error(`${ENDPOINT_NAME} FAILURE`, error);

                    reject(error);
                }
            })
            // does not work
            // @see https://github.com/grpc/grpc-web/issues/289
            .on('end', () => Logger.log(`${ENDPOINT_NAME} stream end`))
    });
};