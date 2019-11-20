import { LogLevel } from "../types";
import { LOG_LEVEL } from "../../utils/constants";


/**
 * Handles logging into console based on defined log level
 */
class Logger{

    private logLevel: LogLevel;

    constructor(logLevel: LogLevel = LogLevel.debug){
        this.logLevel = logLevel;
    }

    /**
     * Log debug info for identifying errors
     * @param message 
     * @param data 
     */
    public debug(message: string, ...data: any[]){
        if(this.logLevel <= LogLevel.debug){
            console.log.call(console, message, ...data);
        }
    }

    /**
     * Logs process info for tracking details
     * @param message 
     * @param data 
     */
    public log(message: string, ...data: any[]){
        if(this.logLevel <= LogLevel.log){
            console.log.call(console, message, ...data);
        }
    }

    /**
     * Logs issues from which we can recover from without data loss. E.g. package without data
     * @param message 
     * @param data 
     */
    public warn(message: string, ...data: any[]){
        if(this.logLevel <= LogLevel.warn){
            console.warn.call(console, message, ...data);
        }
    }

    /**
     * Logs important errors, when data loss occurs. E.g. corrupted package
     * @param message 
     * @param data 
     */
    public error(message: string, ...data: any[]){
        if(this.logLevel <= LogLevel.error){
            console.error.call(console, message, ...data);
        }
    }
}

export default new Logger(LOG_LEVEL);