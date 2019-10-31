import argv from 'argv';

import { LogLevel } from '../importer/types';



const process_args = argv
    .option([      
        {
            name: "port",
            short: "p",
            type: "string",
            description: "Defines port where runs server http instance",
            example: "... -p 8080 or --port=8080"
        },
        {
            name: "secureport",
            short: "sp",
            type: "string",
            description: "Defines port where runs server https instance",
            example: "... -sp 8443 or --secureport=8443"
        },
        {
            name: "registry",
            short: "r",
            type: "string",
            description: "Defines location of operators registry instance with port",
            example: "... -r localhost:50051 or --registry=localhost:50051"
        },
        {
            name: "log",
            short: "l",
            type: "number",
            description: "Defines log level where 0=debug, 1=log, 2=warn and 3=error",
            example: "... -l 2 or --log=2"
        }
    ])
    .version('1.0')
    .run();

console.log(process_args);

const env = process.env || {};

export const serverPort = env.PORT || process_args.options.port || 8080;
export const secureServerPort = env.SECUREPORT || process_args.options.secureport || 8443;


export const USE_REGISTRY = !!env.REGISTRY || !!process_args.options.registry || false;
export const REGISTRY_ADDRESS = env.REGISTRY || process_args.options.registry || 'localhost:50051';
export const LOG_LEVEL = env.LOG_LEVEL && parseInt(env.LOG_LEVEL) || process_args.options.log || LogLevel.warn;


// TODO: Enable SSL
export const useSSL = false && !(env.USESSL === 'false');
export const keysDirectory = env.KEYDIR || '';