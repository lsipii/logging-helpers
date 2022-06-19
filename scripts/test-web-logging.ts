import { colourFormatCliText, log as cliLog } from "../src/server/loggingOutputs";
import { appLog, log } from "../src/web";

async function testLog() {
    appLog("App", "nice notice log from app");
    appLog("App", "error", "an error log from app");
    appLog("App", "debug", "a debug log from app", "more text headings", { object: "content" }, 123);

    log("nice basic log");
    log({ object: "content" }, 123);
}

// Test runner
async function main() {
    const tests = [testLog];

    for (const testExecutor of tests) {
        await testExecutor();
        cliLog(colourFormatCliText("OK", "green"));
    }
}

main();
