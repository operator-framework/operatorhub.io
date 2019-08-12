enum LOG_LEVEL {
    debug,
    log,
    warn,
    error
}

/**
 * Handles logging into console based on defined log level
 */
class Logger{

    private logLevel: LOG_LEVEL;

    constructor(logLevel: LOG_LEVEL = LOG_LEVEL.debug){
        this.logLevel = logLevel;
    }

    /**
     * Log debug info for identifying errors
     * @param message 
     * @param data 
     */
    public debug(message: string, ...data: any[]){
        if(this.logLevel <= LOG_LEVEL.debug){
            console.log.call(console, message, ...data);
        }
    }

    /**
     * Logs process info for tracking details
     * @param message 
     * @param data 
     */
    public log(message: string, ...data: any[]){
        if(this.logLevel <= LOG_LEVEL.log){
            console.log.call(console, message, ...data);
        }
    }

    /**
     * Logs issues from which we can recover from without data loss. E.g. package without data
     * @param message 
     * @param data 
     */
    public warn(message: string, ...data: any[]){
        if(this.logLevel <= LOG_LEVEL.warn){
            console.warn.call(console, message, ...data);
        }
    }

    /**
     * Logs important errors, when data loss occurs. E.g. corrupted package
     * @param message 
     * @param data 
     */
    public error(message: string, ...data: any[]){
        if(this.logLevel <= LOG_LEVEL.error){
            console.error.call(console, message, ...data);
        }
    }
}

export default new Logger(LOG_LEVEL.warn);