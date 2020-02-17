import { Request, Response } from 'express';
import { getOperatorsData, getOperator } from '../utils';

/**
 * Generates install yaml from template
 * @param packageName 
 * @param channelName 
 * @param isGlobalOperator 
 */
const createYaml = (packageName: string, channelName: string, isGlobalOperator: boolean) => {
    if (isGlobalOperator) {
        return `apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: my-${packageName}
  namespace: operators
spec:
  channel: ${channelName}
  name: ${packageName}
  source: operatorhubio-catalog
  sourceNamespace: olm`;
    }

    return `apiVersion: v1
kind: Namespace
metadata:
  name: my-${packageName}
---
apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: operatorgroup
  namespace: my-${packageName}
spec:
  targetNamespaces:
  - my-${packageName}
---
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: my-${packageName}
  namespace: my-${packageName}
spec:
  channel: ${channelName}
  name: ${packageName}
  source: operatorhubio-catalog
  sourceNamespace: olm`;
};

/**
 * Generate install yaml command with namespace where to install
 * @param request 
 * @param response 
 */
export function generateInstallYaml(request: Request, response: Response) {

    let operatorChannelName;
    let operatorPackageName;

    // support schema as /install/etcd.yaml
    // or /install/clusterwide-alpha/etcd.yaml
    
    const fields = request.url.split('/');
    if (fields.length === 4) {
        operatorChannelName = fields[2];
        operatorPackageName = fields[3].replace('.yaml', '');

    } else if (fields.length === 3) {
        operatorPackageName = fields[2].replace('.yaml', '');

    } else {
        response.status(400).send(`Invalid request, you must provide the <operator-name>.yaml`);
        return;
    }

    const operatorPackage = getOperatorsData().find(opPackage => opPackage.name === operatorPackageName);

    if (operatorPackage) {
        const channelName = operatorChannelName || operatorPackage.defaultChannelName;
        const operator = getOperator(operatorPackage, channelName);

        if(operator){
            response.send(createYaml(operatorPackageName, channelName, operator.globalOperator));

        } else {
            response.status(500).send(`Requested channel does not exists or there is no default channel in operator package`);
        }

    } else {
        console.warn(`Server can't find operator package with name ${operatorPackageName}`);
        response.status(400).send(`Server can't find operator package "${operatorPackageName}"`);
    }
    response.status(500);
};
