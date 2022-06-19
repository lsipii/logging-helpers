import { clearCurrentLine, logObject, logRaw } from "../loggingOutputs";
import BaseLoggingService from "./BaseLoggingService";

export default class StandardOut extends BaseLoggingService {
    log(...message) {
        logObject(...message);
    }

    logRaw(...message) {
        logRaw(...message);
    }

    clearCurrentLine() {
        clearCurrentLine();
    }
}
