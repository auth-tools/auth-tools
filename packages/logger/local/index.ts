import DefaultLogger, { COLORS, Logger } from "@auth-tools/logger";

DefaultLogger.log("debug", `"debug" log with DefaultLogger`);
DefaultLogger.log("info", `"info" log with DefaultLogger`);
DefaultLogger.log("warn", `"warn" log with DefaultLogger`);
DefaultLogger.log("error", `"error" log with DefaultLogger`);

//set config after creation
DefaultLogger.setConfig({
  disableColor: true,
  formatString: "Color disabled: [%l] %d %m",
});

//log shorthands
DefaultLogger.debug(`"debug" log with DefaultLogger and updated config`);
DefaultLogger.info(`"info" log with DefaultLogger and updated config`);
DefaultLogger.warn(`"warn" log with DefaultLogger and updated config`);
DefaultLogger.error(`"error" log with DefaultLogger and updated config`);

//multiple arguments
DefaultLogger.log("error", `Argument 1`, "Argument 2");

//update config again
DefaultLogger.setConfig({ disableColor: false, formatString: "Built-In: %m" });

//builtin Methods
DefaultLogger.log("debug", DefaultLogger.color("Red", COLORS.error));
DefaultLogger.log("info", DefaultLogger.twoDigits("1"));
DefaultLogger.log("warn", DefaultLogger.currentTime());
DefaultLogger.log("error", DefaultLogger.currentDate());

//create custom logger instance
const logger2 = new Logger({
  disableColor: false, //set to true to disable all colors
  formatString: [
    //all replacement vars:
    "Vars: %t = HH:MM:SS",
    "Vars: %d = YYYY-MM-DD",
    "Vars: %L = LEVEL",
    "Vars: %l = level",
    "Vars: %m = message",
  ].join("\n"),
});

logger2.log("error", "Hallo");

//update config to disable debug and warn
logger2.setConfig({
  formatString: "Disabled Methods: [%L] %t %m",
  methods: {
    debug: false,
    warn: false,
  },
});

logger2.debug("Shouldn't log");
logger2.info("Should log");
logger2.warn("Shouldn't log");
logger2.error("Should log");

//format string with current instance config
logger2.setConfig({
  formatString: "Format String: [%m]",
});
const formatted = logger2.format("info", "MY CUSTOM STRING");
console.log(formatted);
