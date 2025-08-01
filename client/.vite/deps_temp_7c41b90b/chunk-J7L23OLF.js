import {
  entityKind
} from "./chunk-MJCGN2UF.js";
import {
  __publicField
} from "./chunk-WOOG5QLI.js";

// node_modules/drizzle-orm/logger.js
var _a;
_a = entityKind;
var ConsoleLogWriter = class {
  write(message) {
    console.log(message);
  }
};
__publicField(ConsoleLogWriter, _a, "ConsoleLogWriter");
var _a2;
_a2 = entityKind;
var DefaultLogger = class {
  constructor(config) {
    __publicField(this, "writer");
    this.writer = (config == null ? void 0 : config.writer) ?? new ConsoleLogWriter();
  }
  logQuery(query, params) {
    const stringifiedParams = params.map((p) => {
      try {
        return JSON.stringify(p);
      } catch {
        return String(p);
      }
    });
    const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
    this.writer.write(`Query: ${query}${paramsStr}`);
  }
};
__publicField(DefaultLogger, _a2, "DefaultLogger");
var _a3;
_a3 = entityKind;
var NoopLogger = class {
  logQuery() {
  }
};
__publicField(NoopLogger, _a3, "NoopLogger");

export {
  ConsoleLogWriter,
  DefaultLogger,
  NoopLogger
};
//# sourceMappingURL=chunk-J7L23OLF.js.map
