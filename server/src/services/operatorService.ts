import _ from 'lodash';
import { Request, Response } from 'express';
import { getOperatorsIndex, getOperatorsData, getChannelMetadataList, getOperator } from '../utils';


/**
 * Return prebuilt operators index
 * @param request 
 * @param response 
 */
export function fetchOperators(request: Request, response: Response) {

    response.send({
        operators: getOperatorsIndex()
    });
};

/**
 * Find operator using request query and return its data
 * @param request 
 * @param response 
 */
export function fetchOperator(request: Request, response: Response) {
    // packageName is mandatory, rest optional
    const { name, channel, packageName } = request.query;

    if (packageName) {
        const operatorPackage =getOperatorsData().find(opPackage => opPackage.name === packageName);

        if (operatorPackage) {
            // inject channel data here to reduce imported index size 
            // would lead to redundant repeated values in index
            const channelsMetadata = getChannelMetadataList(operatorPackage);
            const operator = getOperator(operatorPackage, channel, name);
            
            if (operator) {
                response.send({
                    operator: {
                        ...operator,
                        channels: channelsMetadata
                    }
                });

            } else {
                response.status(400).send(`Requested operator version or channel does not exists on server.`);
            }

        } else {
            console.warn(`Server can't find operator package ${packageName}`);
            response.status(400).send(`Server can't find operator package ${packageName}`);
        }
    } else {
        response.status(400).send("Request without package name is not supported");
    }    
}
