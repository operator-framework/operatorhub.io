import { LogLevel } from "./types";

const env = process.env || {};

export const REGISTRY_ADDRESS = env.REGISTRY_ADDRESS || 'localhost';
export const REGISTRY_PORT = env.REGISTRY_PORT || '50051';
export const OUTPUT_PATH = env.OUTPUT_PATH || './cache/operators.json';
export const LOG_LEVEL = env.LOG_LEVEL ? parseInt(env.LOG_LEVEL) : LogLevel.warn;
