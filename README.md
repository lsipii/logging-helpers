# logging-helpers

Utilities for logging javascript and NodeJs applications

## Install

```
npm install logging-helpers
```

## Usage

NodeJs example:

```TypeScript
import { Logger } from "@lsipii/logging-helpers/server";
const logger = new Logger()

logger.log("just some text")
logger.log({content: "just some data"})

logger.log("Subject 1", "log input")
logger.log("Subject 1", {content: "data"})
logger.log("Subject 2", "more log input")
logger.log("Subject 2::subtext", "even more log input")
logger.log("Subject 1", "back to subject 1")

logger.log(new Error('Test exception'))
```

Example output:

```bash
just some text
{
    "content": "just some data"
}
Subject 1: log input
> Subject 1: {
    "content": "data"
}
Subject 2: more log input
> Subject 2::subtext → even more log input
> Subject 1: back to subject 1
{
    "name": "Error",
    "message": "Test exception",
    "stack": "Error: Test exception\n    at /home/lsipii/Projects/commandline-helpers/scripts/test-logging.ts:17:20\n    at Generator.next (<anonymous>)\n    at /home/lsipii/Projects/commandline-helpers/scripts/test-logging.ts:8:71\n    at new Promise (<anonymous>)\n    at __awaiter (/home/lsipii/Projects/commandline-helpers/scripts/test-logging.ts:4:12)\n    at testLog (/home/lsipii/Projects/commandline-helpers/scripts/test-logging.ts:16:12)\n    at /home/lsipii/Projects/commandline-helpers/scripts/test-logging.ts:86:11\n    at Generator.next (<anonymous>)\n    at /home/lsipii/Projects/commandline-helpers/scripts/test-logging.ts:8:71\n    at new Promise (<anonymous>)"
}

```

Browser console output example:

```TypeScript
import { appLog, log } from "@lsipii/logging-helpers/web";

appLog("App", "nice notice log from app");
appLog("App", "error", "an error log from app");
appLog("App", "debug", "a debug log from app", "more text headings", { object: "content" }, 123);

log("nice basic log");
log({ object: "content" }, 123);
```

Example output:

```bash
App Info: nice notice log from app
App Error: an error log from app
App Debug: a debug log from app → more text headings { object: 'content' } 123
nice basic log
{ object: 'content' }  123
```

## Examples

For basic examples see [./scripts/test-logging.ts](./scripts/test-logging.ts)
