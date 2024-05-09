import {
  AuthBase,
  AuthProtocol,
  AuthRequest,
  AuthResponse,
  DeepRequired,
  InterceptEventCallbacks,
  UseEventCallbacks,
  User,
} from "@auth-tools/base";
import { LogFunction } from "@auth-tools/logger";
import { undefinedInterceptEvent, undefinedUseEvent } from "./events";
import { createRegister } from "./methods/register";
import { createLogin } from "./methods/login";
import { createLogout } from "./methods/logout";
import { createRefresh } from "./methods/refresh";
import { createCheck } from "./methods/check";
import { createValidate } from "./methods/validate";

//states of a method
type MethodState = "active" | "disabled" | "removed";

//config passed by user to class
export type AuthServerConfig = {
  secrets: {
    accessToken: string;
    refreshToken: string;
  };
  expiresIn?: number;
  sensitive?: {
    api?: boolean;
    logs?: boolean;
  };
  methods?: {
    validate?: MethodState;
    register?: MethodState;
    login?: MethodState;
    logout?: MethodState;
    refresh?: MethodState;
    check?: MethodState;
  };
};

//all use events
export type AuthServerUseEvents = {
  getUserByMail: {
    data: User<"email">;
    return: {
      user: User<"id" | "email" | "username" | "hashedPassword"> | null;
    };
  };
  getUserByName: {
    data: User<"username">;
    return: {
      user: User<"id" | "email" | "username" | "hashedPassword"> | null;
    };
  };
  hashPassword: {
    data: User<"password">;
    return: User<"hashedPassword">;
  };
  checkToken: {
    data: User<"refreshToken">;
    return: { exists: boolean };
  };
  storeToken: {
    data: User<"refreshToken">;
    return: {};
  };
  deleteToken: {
    data: User<"refreshToken">;
    return: {};
  };
  validateMail: {
    data: User<"email">;
    return: { isValid: boolean };
  };
  validatePassword: {
    data: User<"password">;
    return: { isValid: boolean };
  };
  genId: {
    data: User<"email" | "username">;
    return: { id: string };
  };
  storeUser: {
    data: { user: User<"id" | "email" | "username" | "hashedPassword"> };
    return: {};
  };
  checkPassword: {
    data: User<"password" | "hashedPassword">;
    return: { matches: boolean };
  };
};

//all intercept events
export type AuthServerInterceptEvents = {
  register: {
    data: { user: User<"id" | "email" | "username" | "hashedPassword"> };
  };
  login: {
    data: User<"accessToken" | "refreshToken"> & {
      user: User<"id" | "email" | "username" | "hashedPassword">;
      payload: User<"id">;
    };
  };
  logout: {
    data: User<"refreshToken"> & { payload: User<"id"> };
  };
  refresh: {
    data: User<"refreshToken"> & { payload: User<"id"> };
  };
  check: {
    data: User<"accessToken" | "refreshToken"> & {
      payload: User<"id">;
    };
  };
};

export type AuthServerMethod<MethodName extends keyof AuthProtocol> = (
  data: AuthRequest<MethodName>
) => Promise<AuthResponse<MethodName>>;

type AuthServerMethods = {
  [MethodName in keyof AuthProtocol]?: AuthServerMethod<MethodName>;
};

export class AuthServer extends AuthBase<
  AuthServerConfig,
  AuthServerUseEvents,
  AuthServerInterceptEvents
> {
  //all methods
  public methods: AuthServerMethods;

  //auth server constructor
  constructor(config: AuthServerConfig, log: LogFunction) {
    //config with default values
    const defaultedConfig: DeepRequired<AuthServerConfig> = {
      secrets: {
        accessToken: config.secrets.accessToken,
        refreshToken: config.secrets.refreshToken,
      },
      expiresIn: config.expiresIn ?? 900, //by default accessToken expires in 900s (15min)
      sensitive: {
        api: config.sensitive?.api ?? true, //by default api will not directly expose type of error which could leak information of the database
        logs: config.sensitive?.logs ?? false, //by default logs WILL directly expose type of error which could leak information of the database
      },
      methods: {
        validate: config.methods?.validate ?? "active", //by default validate is active
        register: config.methods?.register ?? "active", //by default register is active
        login: config.methods?.login ?? "active", //by default login is active
        logout: config.methods?.logout ?? "active", //by default logout is active
        refresh: config.methods?.refresh ?? "active", //by default refresh is active
        check: config.methods?.check ?? "active", //by default check is active
      },
    };

    //defaults for use event callbacks
    const defaultedUseEvents: UseEventCallbacks<AuthServerUseEvents> = {
      getUserByMail: undefinedUseEvent("getUserByMail", { user: null }, log),
      getUserByName: undefinedUseEvent("getUserByName", { user: null }, log),
      storeUser: undefinedUseEvent("storeUser", {}, log),
      checkToken: undefinedUseEvent("checkToken", { exists: false }, log),
      storeToken: undefinedUseEvent("storeToken", {}, log),
      deleteToken: undefinedUseEvent("deleteToken", {}, log),
      validateMail: undefinedUseEvent("validateMail", { isValid: false }, log),
      validatePassword: undefinedUseEvent(
        "validatePassword",
        { isValid: false },
        log
      ),
      hashPassword: undefinedUseEvent(
        "hashPassword",
        { hashedPassword: "" },
        log
      ),
      genId: undefinedUseEvent("genId", { id: "" }, log),
      checkPassword: undefinedUseEvent(
        "checkPassword",
        { matches: false },
        log
      ),
    };

    //defaults for intercept event callbacks
    const defaultedInterceptEvents: InterceptEventCallbacks<AuthServerInterceptEvents> =
      {
        register: undefinedInterceptEvent<"register">(),
        login: undefinedInterceptEvent<"login">(),
        logout: undefinedInterceptEvent<"logout">(),
        refresh: undefinedInterceptEvent<"refresh">(),
        check: undefinedInterceptEvent<"check">(),
      };

    //init authbase class
    super(defaultedConfig, log, defaultedUseEvents, defaultedInterceptEvents);

    //all auth methods
    this.methods = {
      validate:
        this._internal.config.methods.validate !== "removed"
          ? createValidate(this._internal)
          : undefined,
      register:
        this._internal.config.methods.register !== "removed"
          ? createRegister(this._internal)
          : undefined,
      login:
        this._internal.config.methods.login !== "removed"
          ? createLogin(this._internal)
          : undefined,
      logout:
        this._internal.config.methods.logout !== "removed"
          ? createLogout(this._internal)
          : undefined,
      refresh:
        this._internal.config.methods.refresh !== "removed"
          ? createRefresh(this._internal)
          : undefined,
      check:
        this._internal.config.methods.check !== "removed"
          ? createCheck(this._internal)
          : undefined,
    };
  }
}
