import {
  AuthBase,
  AuthProtocol,
  AuthRequest,
  AuthResponse,
  Promisify,
  UseEventCallbacks,
  User,
} from "@auth-tools/base";
import { LogFunction } from "@auth-tools/logger";
import { undefinedUseEvent } from "./events";
import { createRegister } from "./methods/register";
import { createLogin } from "./methods/login";
import { createLogout } from "./methods/logout";
import { createRefresh } from "./methods/refresh";
import { createCheck } from "./methods/check";

type MethodReturn<MethodName extends keyof AuthProtocol> =
  | { clientError: true; res: null }
  | { clientError: false; res: AuthResponse<MethodName> };

export type AuthClientConnector<MethodName extends keyof AuthProtocol> = (
  method: MethodName,
  data: AuthRequest<MethodName>
) => Promisify<MethodReturn<MethodName>>;

type TokenTypes = "accessToken" | "refreshToken";

//config passed by user to class
export type AuthClientConfig = {
  connector: AuthClientConnector<keyof AuthProtocol>;
};

//all use events
export type AuthClientUseEvents = {
  getToken: {
    data: { type: TokenTypes };
    return: { token: User<TokenTypes>[TokenTypes] | null };
  };
  storeToken: {
    data: { type: TokenTypes; token: User<TokenTypes>[TokenTypes] };
    return: {};
  };
  deleteToken: {
    data: { type: TokenTypes };
    return: {};
  };
};

export type AuthClientMethod<
  MethodName extends keyof AuthProtocol,
  NoData extends boolean = MethodName extends "logout" | "refresh" | "check"
    ? true
    : false
> = (
  data: NoData extends true ? {} : AuthRequest<MethodName>
) => Promise<MethodReturn<MethodName>>;

type AuthClientMethods = {
  [MethodName in keyof AuthProtocol]: AuthClientMethod<MethodName>;
};

export class AuthClient extends AuthBase<
  AuthClientConfig,
  AuthClientUseEvents,
  {}
> {
  //all methods
  public methods: Omit<AuthClientMethods, "validate">;

  constructor(config: AuthClientConfig, log: LogFunction) {
    //defaults for use event callbacks
    const defaultedUseEvents: UseEventCallbacks<AuthClientUseEvents> = {
      getToken: undefinedUseEvent("getToken", { token: "" }, log),
      storeToken: undefinedUseEvent("storeToken", {}, log),
      deleteToken: undefinedUseEvent("deleteToken", {}, log),
    };

    //init authbase class
    super(config, log, defaultedUseEvents, {});

    //all auth methods
    this.methods = {
      register: createRegister(this._internal),
      login: createLogin(this._internal),
      logout: createLogout(this._internal),
      refresh: createRefresh(this._internal),
      check: createCheck(this._internal),
    };
  }
}
