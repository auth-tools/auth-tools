import {
  AuthBase,
  AuthProtocol,
  AuthRequest,
  AuthResponse,
  Payload,
  Promisify,
  UseEventCallbacks,
  User,
} from "@auth-tools/base";
import { LogFunction } from "@auth-tools/logger";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { undefinedUseEvent } from "./events";
import { createRegister } from "./methods/register";
import { createLogin } from "./methods/login";
import { createLogout } from "./methods/logout";
import { createRefresh } from "./methods/refresh";
import { createCheck } from "./methods/check";

export type MethodReturn<MethodName extends keyof AuthProtocol> =
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

  //check if user is logged in
  public async isLoggedIn(): Promise<boolean> {
    const checkResponse = await this.methods.check({});

    if (checkResponse.clientError) return false;

    if (!checkResponse.res.error) return true;

    const refreshResponse = await this.methods.refresh({});

    if (refreshResponse.clientError) return false;

    if (!refreshResponse.res.error) return true;
    else return false;
  }

  //get token payload
  public async userPayload(): Promise<Payload | null> {
    const getRefreshToken = await this._internal.useEventCallbacks.getToken({
      type: "refreshToken",
    });

    if (getRefreshToken.error || getRefreshToken.token === null) return null;

    const tokenData = jwtDecode<JwtPayload & Payload>(getRefreshToken.token);

    return { id: tokenData.id };
  }
}
