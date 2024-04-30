//util types
type DeepRequired<T> = { [K in keyof T]-?: DeepRequired<T[K]> };

//types for the logger
export type LogLevels = "debug" | "info" | "warn" | "error";
export type LogFunction = (level: LogLevels, ...message: string[]) => void;
export type LogConfig = {
  disableColor?: boolean;
  formatString?: string;
  methods?: {
    [key in LogLevels]?: boolean;
  };
};

//enum for all ansi colors
export enum COLORS {
  time = "90;1",
  date = "32;1",
  debug = "35;1",
  info = "36",
  warn = "33",
  error = "31;1",
}

export class Logger {
  private config: DeepRequired<LogConfig>;
  constructor(config?: LogConfig) {
    //make sure log functions contexts are set to class
    this.debug = this.debug.bind(this);
    this.info = this.info.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);
    this.setConfig = this.setConfig.bind(this);
    this.log = this.log.bind(this);
    this.color = this.color.bind(this);
    this.format = this.format.bind(this);
    this.twoDigits = this.twoDigits.bind(this);
    this.currentTime = this.currentTime.bind(this);
    this.currentDate = this.currentDate.bind(this);

    //set config with defaults
    this.config = {
      disableColor: config?.disableColor ?? false,
      formatString: config?.formatString ?? "[%L] %t %m",
      methods: {
        debug: config?.methods?.debug ?? true,
        info: config?.methods?.info ?? true,
        warn: config?.methods?.warn ?? true,
        error: config?.methods?.error ?? true,
      },
    };
  }

  //shorthand for Logger.log("debug", ...)
  public debug(...messages: string[]): void {
    this.log("debug", ...messages);
  }

  //shorthand for Logger.log("info", ...)
  public info(...messages: string[]): void {
    this.log("info", ...messages);
  }

  //shorthand for Logger.log("warn", ...)
  public warn(...messages: string[]): void {
    this.log("warn", ...messages);
  }

  //shorthand for Logger.log("error", ...)
  public error(...messages: string[]): void {
    this.log("error", ...messages);
  }

  //config after initial creation
  public setConfig(config?: LogConfig): void {
    this.config = {
      disableColor: config?.disableColor ?? this.config.disableColor,
      formatString: config?.formatString ?? this.config.formatString,
      methods: {
        debug: config?.methods?.debug ?? this.config.methods.debug,
        info: config?.methods?.info ?? this.config.methods.info,
        warn: config?.methods?.warn ?? this.config.methods.warn,
        error: config?.methods?.error ?? this.config.methods.error,
      },
    };
  }

  //log the message
  public log(level: LogLevels, ...messages: string[]): void {
    messages.forEach((message) => {
      if (this.config.methods[level])
        console[level](this.format(level, message));
    });
  }

  //color a string
  public color(str: string, ansiColorValue: string): string {
    return this.config.disableColor
      ? str
      : `\x1b[${ansiColorValue}m${str}\x1b[0m`;
  }

  //format multi line logs
  public format(level: LogLevels, message: string): string {
    return message
      .split("\n")
      .map((line) => this.formatLine(level, line))
      .join("\n");
  }

  public twoDigits(str: string): string {
    return str.length === 1 ? `0${str}` : str;
  }

  //format current time as HH:MM:SS
  public currentTime(): string {
    const date = new Date();
    return (
      this.twoDigits(date.getHours().toString()) +
      ":" +
      this.twoDigits(date.getMinutes().toString()) +
      ":" +
      this.twoDigits(date.getSeconds().toString())
    );
  }

  //format current date as YYYY-MM-DD
  public currentDate(): string {
    const date = new Date();
    return (
      this.twoDigits(date.getFullYear().toString()) +
      "-" +
      this.twoDigits(date.getMonth().toString()) +
      "-" +
      this.twoDigits(date.getDate().toString())
    );
  }

  //format a single log line
  private formatLine(level: LogLevels, line: string): string {
    return this.config.formatString
      .replace("%t", this.color(this.currentTime(), COLORS["time"])) //replace %t with current date (HH:MM:SS)
      .replace("%d", this.color(this.currentDate(), COLORS["date"])) //replace %d with current date (YYYY-MM-DD)
      .replace("%L", this.color(level.toUpperCase(), COLORS[level])) //replace %L (uppercase level) with given level
      .replace("%l", this.color(level.toLowerCase(), COLORS[level])) //replace %l (lowercase level) with given level
      .replace("%m", line); //replace %m (message) with given message
  }
}
