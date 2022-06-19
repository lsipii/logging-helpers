export interface ILoggingServiceOptions {
    context?: string;
    patterns?: Array<string>;
}

export default abstract class BaseLoggingService {
    #parent = null;

    constructor(parent) {
        this.#parent = parent;
    }

    log(...message): void {
        throw new Error("Must be implemented");
    }

    isEnabled(): boolean {
        return true;
    }

    clearCurrentLine() {}

    async initialize(options?: ILoggingServiceOptions): Promise<void> {}
    async finalize(): Promise<void> {}
}
