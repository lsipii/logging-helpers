import { exceptionToObject } from "@lsipii/transformation-helpers/Transformations";
import { ifInArray, addToArray } from "@lsipii/transformation-helpers/Arrays";
import { ensureString, ifTextAlphaNumeric } from "@lsipii/transformation-helpers/Strings";

import { colourPrimaryLogEventText, colourSecondaryLogEventText, colourFormatPrettyObsArrowText, colourFormatCliText, getDurationLog } from "./loggingOutputs";

import { ILoggingServiceOptions } from "./log-services/BaseLoggingService";
import * as LoggingServices from "./log-services";

export interface ILoggerContext {
    name?: string;
    settings?: { [attr: string]: any };
}

export default class Logger {
    context: ILoggerContext;
    #loggers = {};
    #lastPrimarySubjects: Array<string> = [];

    #loggingEnabled: boolean = true;

    #logAnywayIfNotDisabled: boolean = false;

    #debugDate: Date;

    constructor(context?: ILoggerContext) {
        this.context = context;
    }

    /**
     * A log
     *
     * @param subject
     * @param logData
     */
    log(...logData: any): void {
        if (this.ifLoggingEnabled()) {
            this.#log(...this.#parseLogData(...logData));
        }
    }

    /**
     * Loggog
     *
     * @param logStuff
     */
    logAny(...logStuff: any): void {
        if (this.ifLoggingEnabled()) {
            this.#log(...logStuff);
        }
    }

    /**
     * Loggog raw
     *
     * @param logStuff
     */
    logRaw(...logStuff: any): void {
        if (this.ifLoggingEnabled()) {
            this.#logRaw(...logStuff);
        }
    }

    /**
     * A log raw subject
     *
     * @param subject
     * @param logData
     */
    logRawSubject(...logData: any): void {
        this.logRaw(...this.#parseLogData(...logData));
    }

    /**
     * Debug helper
     *
     * @param data
     */
    debug(...data): void {
        this.#log(...data);
    }

    /**
     * Debug helper with timer
     *
     * @param data
     */
    debugStart(...data): void {
        const durationLog = getDurationLog(null, "DEBUG");
        this.#debugDate = durationLog.date;
        this.#log(durationLog.message);
        this.#log("DEBUG A:", ...data);
    }

    /**
     * Debug helper with timer
     *
     * @param data
     */
    debugStop(...data): void {
        this.#log("DEBUG B:", ...data);
        const durationLog = getDurationLog(this.#debugDate, "DEBUG");
        this.#log(durationLog.message);
        this.#debugDate = null;
    }

    /**
     *
     */
    clearCurrentLine() {
        this.#clearCurrentLine();
    }

    /**
     * If logging enabled
     */
    ifLoggingEnabled(): boolean {
        return this.#loggingEnabled || this.#logAnywayIfNotDisabled;
    }

    /**
     * Sets logging enabled override
     *
     * @param {boolean}
     */
    setAlwaysLog(logAnywayIfNotDisabled: boolean): void {
        this.#logAnywayIfNotDisabled = logAnywayIfNotDisabled;
    }

    /**
     * @param {boolean}
     */
    setLoggingEnabled(enabled: boolean): void {
        this.#loggingEnabled = enabled;
    }

    /**
     * @return {boolean}
     */
    getLoggingEnabled(): boolean {
        return this.#loggingEnabled;
    }

    /**
     * A primary log event text formatter
     *
     * @param {string}
     * @return {string}
     */
    colourPrimaryLogEventText(subjectText: string): string {
        return colourPrimaryLogEventText(subjectText, this.shouldColouringBeDisabled());
    }

    /**
     * A secondary log event text formatter
     *
     * @param {string}
     * @return {string}
     */
    colourSecondaryLogEventText(subjectText: string): string {
        return colourSecondaryLogEventText(subjectText, this.shouldColouringBeDisabled());
    }

    /**
     * An attencion seeking text formating
     *
     * @param {string}
     * @return {string}
     */
    colourFormatPrettyObsArrowText(subjectText: string): string {
        return colourFormatPrettyObsArrowText(subjectText, this.shouldColouringBeDisabled());
    }

    /**
     * A colour text formating
     *
     * @param {string}
     * @param {string}
     * @return {string}
     */
    colourFormatCliText(subjectText: string, colourCode: string): string {
        return colourFormatCliText(subjectText, colourCode, this.shouldColouringBeDisabled());
    }

    /**
     *
     * @param primaryObjectiveText
     * @param secondarySubject
     */
    colourSubObjectiveText(primaryObjectiveText: string, secondarySubject: string): string {
        return `${primaryObjectiveText}:${this.colourFormatCliText(secondarySubject, "FgWhite")} →`;
    }

    /**
     * @return {boolean}
     */
    shouldColouringBeDisabled(): boolean {
        return false;
    }

    /**
     *
     * @param subject
     */
    #parseLogData(...logData: any): Array<any> {
        const parseSubjectText = (subject: string): string => {
            let primarySubject = ensureString(subject, { convert: true });
            let secondarySubject = "";
            const parts = primarySubject.split("::");
            if (parts.length == 2) {
                primarySubject = parts[0];
                secondarySubject = parts[1];
            }

            if (!ifInArray(this.#lastPrimarySubjects, primarySubject)) {
                this.#lastPrimarySubjects = addToArray(this.#lastPrimarySubjects, primarySubject);
                primarySubject = this.colourPrimaryLogEventText(primarySubject);
            } else {
                if (ifTextAlphaNumeric(primarySubject.charAt(0))) {
                    primarySubject = this.colourSecondaryLogEventText(primarySubject);
                }
            }

            let subjectText = primarySubject;
            if (secondarySubject) {
                subjectText = this.colourSubObjectiveText(subjectText, secondarySubject);
            }
            return subjectText;
        };

        if (logData.length > 1 && typeof logData[0] === "string") {
            logData[0] = parseSubjectText(logData[0]);
        }
        return logData;
    }

    // ------------------------
    // Log outputs
    // ------------------------
    #log(...message) {
        this.#ensureInitialized();
        message = this.#preFormatMessage(message);
        for (const logServiceName in this.#loggers) {
            try {
                if (this.#loggers[logServiceName].isEnabled()) {
                    this.#loggers[logServiceName].log(...message);
                }
            } catch (error) {
                this.#handleLoggingError(error);
            }
        }
    }

    #logRaw(...message) {
        this.#ensureInitialized();
        message = this.#preFormatMessage(message);
        for (const logServiceName in this.#loggers) {
            try {
                if (this.#loggers[logServiceName].isEnabled()) {
                    if (typeof this.#loggers[logServiceName].logRaw === "function") {
                        this.#loggers[logServiceName].logRaw(...message);
                    } else {
                        this.#loggers[logServiceName].log(...message);
                    }
                }
            } catch (error) {
                this.#handleLoggingError(error);
            }
        }
    }

    /**
     *
     */
    #clearCurrentLine() {
        this.#ensureInitialized();
        for (const logServiceName in this.#loggers) {
            try {
                if (this.#loggers[logServiceName].isEnabled()) {
                    this.#loggers[logServiceName].clearCurrentLine();
                }
            } catch (error) {
                this.#handleLoggingError(error);
            }
        }
    }

    /**
     * Ensures exceptions are printed
     *
     * @param message
     * @returns
     */
    #preFormatMessage(message: Array<any>): Array<any> {
        for (const index in message) {
            if (message[index] instanceof Error) {
                message[index] = exceptionToObject(message[index]);
            }
        }
        return message;
    }

    /**
     * Ensures some output if used without initializing
     */
    #ensureInitialized() {
        if (Object.entries(this.#loggers).length === 0) {
            this.#loggers["StandardOut"] = new LoggingServices.StandardOut(this);
        }
    }

    /**
     *
     * @param error
     */
    #handleLoggingError(error) {
        try {
            new LoggingServices.StandardOut(this).log("Logger", exceptionToObject(error));
        } catch (error) {}
    }

    // ------------------------
    // Log services
    // ------------------------

    /**
     * Setups for a new app exec
     */
    async initialize(logServices: Array<string> = ["StandardOut"], options?: ILoggingServiceOptions): Promise<void> {
        this.#loggers = {};
        for (const logServiceName of logServices) {
            if (typeof this.#loggers[logServiceName] === "undefined") {
                if (typeof LoggingServices[logServiceName] !== "undefined") {
                    this.#loggers[logServiceName] = new LoggingServices[logServiceName](this);
                    try {
                        if (this.#loggers[logServiceName].isEnabled()) {
                            await this.#loggers[logServiceName].initialize(options);
                        }
                    } catch (error) {
                        this.#handleLoggingError(error);
                    }
                }
            }
        }
    }

    /**
     * Stops / finalizes any streams etc, on post app exec phase
     */
    async finalize(): Promise<void> {
        for (const logServiceName in this.#loggers) {
            try {
                if (this.#loggers[logServiceName].isEnabled()) {
                    await this.#loggers[logServiceName].finalize();
                }
            } catch (error) {
                this.#handleLoggingError(error);
            }
        }
    }
}
