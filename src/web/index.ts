import { ifInArray } from "transformation-helpers/Arrays";
import { safeClone } from "transformation-helpers/Transformations";
import { ensureObjectDefaults } from "transformation-helpers/Objects";

/**
 *
 * @param message
 */
function nativeConsoleLog(messagePackage = {}): void {
    const pack = ensureObjectDefaults(messagePackage, { heading: "", colour: "", message: null });

    // Parse base message
    const messageHeading: Array<string> = [];
    const restOfTheMessage: Array<any> = [];

    if (pack.heading) {
        messageHeading.push(pack.heading);
    }
    if (pack.colour) {
        messageHeading.push(pack.colour);
    }
    if (pack.message) {
        if (pack.message instanceof Array && pack.message.length == 1) {
            if (pack.message[0] instanceof Array) {
                for (const mess of pack.message[0]) {
                    restOfTheMessage.push(mess);
                }
            } else {
                restOfTheMessage.push(pack.message[0]);
            }
        } else {
            restOfTheMessage.push(pack.message);
        }
    }

    // Combine first strings

    let nonStringOccurred = false;
    const primedMessageParts = restOfTheMessage.reduce(
        (resultingSlots, item) => {
            if (typeof item === "string" && !nonStringOccurred) {
                resultingSlots.statsWith.push(item);
            } else {
                nonStringOccurred = true;
                resultingSlots.endsWith.push(item);
            }
            return resultingSlots;
        },
        { statsWith: [], endsWith: [] }
    );

    console.log(...messageHeading, primedMessageParts.statsWith.join(" → "), ...primedMessageParts.endsWith);
}

/**
 *
 * @param appName
 * @param message
 */
export function appLog(appName: string = "", ...message: any): void {
    const appHeading = appName ? `${appName} ` : "";
    const logMessage = parseLogMessage(message);
    switch (logMessage.logType) {
        case "error":
            log(`%c${appHeading}Error:`, "color: red", logMessage.message);
            break;
        case "alert":
            log(`%c${appHeading}Alert:`, "color: orange", logMessage.message);
            break;
        case "danger":
        case "crash":
        case "explosion":
            log(`%c${appHeading}Crash`, "color: red", logMessage.message);
            break;
        case "warning":
            log(`%c${appHeading}Warning:`, "color: yellow", logMessage.message);
            break;
        case "notice":
        case "info":
            log(`%c${appHeading}Info:`, "color: blue", logMessage.message);
            break;
        case "debug":
            log(`%c${appHeading}Debug:`, "color: darkgreen", logMessage.message);
            break;
        case "success":
            log(`%c${appHeading}Success:`, "color: green", logMessage.message);
            break;
        default:
            log(`%c${appHeading}Notice:`, "color: cyan", logMessage.message);
    }
}

/**
 * @param message
 */
export function log(...message: any): void {
    if (message.length > 0) {
        const heading = message.shift();
        if (message.length > 0) {
            if (typeof heading === "string" && heading.indexOf("%") === 0 && message.length > 1) {
                const colour = message.shift();
                nativeConsoleLog({ heading: heading, colour: colour, message: message });
            } else {
                nativeConsoleLog({ heading: heading, message: message });
            }
        } else {
            nativeConsoleLog({ message: heading });
        }
    }
}

/**
 * @param key
 * @param stop = false, stops and logs the duration
 */
export function logDuration(key: string, stop: boolean = false) {
    const logKey = `Times: ${key}`;
    if (stop) {
        console.timeEnd(logKey);
    } else {
        console.time(logKey);
    }
}

/**
 *
 * @param message
 * @returns
 */
export function parseLogMessage(message: any): { logType: string; message: any } {
    let logType = "notice";
    if (message instanceof Array) {
        message = safeClone(message);

        if (message.length > 1 && typeof message[0] === "string") {
            const firstPart = message[0].toLowerCase();
            if (ifInArray(["notice", "info", "error", "warning", "danger", "crash", "explosion", "success", "alert", "debug"], firstPart)) {
                logType = firstPart;
                message.shift();
            }
        }
    }
    return { logType: logType, message: message };
}
