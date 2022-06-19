const process = require("process");
const readline = require("readline");

import { getDateNow, getDuration, formatDuration, dateToShortString } from "transformation-helpers/Dates";
import { ensureString, firstCharToUpperCase, niceStringifyObject, niceTrim } from "transformation-helpers/Strings";

/**
 * Console logs with a colour
 *
 * @see: https://stackoverflow.com/a/41407246
 * @see: https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
 *
 * @param text
 * @param colourIdent
 * @param disableColouring
 * @returns
 */
export function colourFormatCliText(text: string, colourIdent: string | Array<string>, disableColouring: boolean = false): string {
    if (disableColouring) {
        return text;
    }

    const getColourEspace = function (code: string): string {
        const colourEscapes = {
            Reset: "\x1b[0m",
            Bright: "\x1b[1m",
            Dim: "\x1b[2m",
            Underscore: "\x1b[4m",
            Blink: "\x1b[5m",
            Reverse: "\x1b[7m",
            Hidden: "\x1b[8m",

            FgBlack: "\x1b[30m",
            FgRed: "\x1b[31m",
            FgGreen: "\x1b[32m",
            FgYellow: "\x1b[33m",
            FgBlue: "\x1b[34m",
            FgMagenta: "\x1b[35m",
            FgCyan: "\x1b[36m",
            FgWhite: "\x1b[37m",

            BgBlack: "\x1b[40m",
            BgRed: "\x1b[41m",
            BgGreen: "\x1b[42m",
            BgYellow: "\x1b[43m",
            BgBlue: "\x1b[44m",
            BgMagenta: "\x1b[45m",
            BgCyan: "\x1b[46m",
            BgWhite: "\x1b[47m",
        };

        if (typeof colourEscapes[code] !== "undefined") {
            return colourEscapes[code];
        } else {
            const foregroundCode = `Fg${firstCharToUpperCase(code)}`;
            if (typeof colourEscapes[foregroundCode] !== "undefined") {
                return colourEscapes[foregroundCode];
            }
        }
        return "";
    };

    if (colourIdent instanceof Array) {
        let escapes = "";
        colourIdent.forEach(function (cI) {
            const colour = getColourEspace(cI);
            if (colour) {
                escapes += colour;
            }
        });

        if (escapes) {
            return escapes + text + getColourEspace("Reset");
        }
    } else {
        const colour = getColourEspace(colourIdent);
        if (colour) {
            return colour + text + getColourEspace("Reset");
        }
    }
    return text;
}

/**
 * Returns a text in console printable from like:
 * ---> MESSAGE IN CAPS <---
 *
 * @param text
 * @param disableColouring
 * @param overrideColour
 * @returns
 */
export function colourFormatPrettyObsArrowText(text: string, disableColouring?: boolean, overrideColour?: string): string {
    const colour = overrideColour ? overrideColour : "FgMagenta";
    return (
        colourFormatCliText("---> ", colour, disableColouring) +
        colourFormatCliText(text, [colour, "Underscore"], disableColouring) +
        colourFormatCliText(" <---", colour, disableColouring)
    );
}

/**
 * Hilights a class topic
 *
 * @param text
 * @param disableColouring
 * @returns
 */
export function colourPrimaryLogEventText(text: string, disableColouring?: boolean): string {
    return colourFormatCliText(niceTrim(text, ":", { onlyFromRight: true }), "Underscore", disableColouring) + ":";
}

/**
 * Hilights a lower class topic
 *
 * @param text
 * @param disableColouring
 * @returns
 */
export function colourSecondaryLogEventText(text: string, disableColouring?: boolean): string {
    return `> ${niceTrim(text, ":", { onlyFromRight: true })}:`;
}

/**
 * Log helper
 *
 * @param message
 */
export function log(...message: any): void {
    if (message.length > 0) {
        const heading = message.shift();
        if (message.length > 0) {
            if (message.length == 1) {
                if (message[0] instanceof Array && message[0].length == 1) {
                    console.log(heading, message[0][0]);
                } else {
                    console.log(heading, message[0]);
                }
            } else {
                console.log(heading, ...message);
            }
        } else {
            console.log(heading);
        }
    }
}

/**
 *
 * @param messages
 * @returns
 */
export function logObject(...messages: any): any {
    const _messages = getLogList(...messages);
    return log(..._messages);
}

/**
 *
 * @param messages
 * @returns
 */
export function getLogList(...messages: any): Array<any> {
    const _messages = [];
    for (const message of messages) {
        if (typeof message === "object") {
            _messages.push(niceStringifyObject(message));
        } else {
            _messages.push(message);
        }
    }
    return _messages;
}

/**
 * Loggog raw
 *
 * @param logStuff
 */
export function logRaw(...logStuff: any): void {
    const text = logStuff.reduce(function (prev, current, index) {
        const currentText = ensureString(current);
        return index == 0 ? currentText : prev + " " + currentText;
    }, "");
    process.stdout.write(text);
}

/**
 *
 * @param startDateTime
 * @param identifier
 * @returns
 */
export function logDuration(startDateTime?: Date, identifier?: string): Date {
    const durationLog = getDurationLog(startDateTime, identifier);
    log(durationLog.message);
    return durationLog.date;
}

/**
 *
 * @param startDateTime
 * @param identifier
 * @returns
 */
export function getDurationLog(startDateTime?: Date, identifier?: string): { date: Date; message: string } {
    const dateNow = getDateNow();
    let message = "";
    if (!(startDateTime instanceof Date)) {
        let headingText = "START";
        if (typeof identifier === "string") {
            headingText = `${identifier}, ${headingText}`;
        }
        message = `[ ${headingText}: ${dateToShortString(dateNow, true)} ]`;
    } else {
        const duration = getDuration(startDateTime, dateNow);
        const durationString = formatDuration(duration);
        let headingText = "END";
        if (typeof identifier === "string") {
            headingText = `${identifier}, ${headingText}`;
        }
        message = `[ ${headingText}: ${dateToShortString(dateNow, true)}, DURATION: ${durationString} ]`;
    }
    return {
        date: dateNow,
        message: message,
    };
}

/**
 *
 */
export function clearCurrentLine() {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
}
