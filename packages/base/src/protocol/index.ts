import { DeepOptional, KeysStartingWith } from "../helpers";
import { AuthMessages } from "./messages";

//all possible method names
type AuthMethodStrings =
  | "server"
  | "validate"
  | "register"
  | "login"
  | "logout"
  | "refresh"
  | "check";

//type builder for an auth response
type AuthResponseBuilder<
  Method extends AuthMethodStrings,
  StatusCode extends number,
  ResponseData extends any,
  InterceptCode extends number = 0,
  AuthMessage = AuthMessages[`${Method}_${StatusCode}`]
> = {
  error: StatusCode extends 0 ? false : true;
  intercepted: InterceptCode extends 0 ? false : true,
  errorType: Method extends "server" ? "server" : "method";
  message: AuthMessage;
  codes: {
    status: StatusCode;
    intercept: InterceptCode;
  };
  data: ResponseData;
};

//definition for argument for an auth response builder
type AuthMethodResponsesDefinition<Method extends AuthMethodStrings> = {
  [ResponseName in keyof KeysStartingWith<
    AuthMessages,
    Method
  >]: AuthResponseBuilder<Method, number, any, number>;
};

//type that builds all responses in one object
type AuthMethodResponses<
  Method extends AuthMethodStrings,
  Responses extends AuthMethodResponsesDefinition<Method>
> = {
  [ResponseName in keyof Responses]: Responses[ResponseName];
} & {
  server_5: AuthResponseBuilder<"server", 5, null>;
};

//type that builds an entire method
type AuthMethodBuilder<
  Method extends AuthMethodStrings,
  Request extends any,
  Responses extends AuthMethodResponsesDefinition<Method>
> = {
  request: DeepOptional<Request>;
  responses: AuthMethodResponses<Method, Responses>;
};

//all data of a user
type UserData = {
  id: string;
  login: string;
  email: string;
  username: string;
  password: string;
  hashedPassword: string;
  accessToken: string;
  refreshToken: string;
};

//a user map
export type User<Keys extends keyof UserData = never> = Pick<UserData, Keys>;

//all auth methods
export type AuthProtocol = {
  validate: AuthMethodBuilder<
    "validate",
    User<"accessToken">,
    {
      validate_0: AuthResponseBuilder<"validate", 0, User<"id">>;
      validate_1: AuthResponseBuilder<"validate", 1, null>;
      validate_2: AuthResponseBuilder<"validate", 2, null>;
      validate_3: AuthResponseBuilder<"validate", 3, null>;
      validate_9: AuthResponseBuilder<"validate", 9, null, number>;
    }
  >;
  register: AuthMethodBuilder<
    "register",
    User<"email" | "username" | "password">,
    {
      register_0: AuthResponseBuilder<
        "register",
        0,
        User<"id" | "email" | "username">
      >;
      register_1: AuthResponseBuilder<"register", 1, null>;
      register_2: AuthResponseBuilder<"register", 2, null>;
      register_3: AuthResponseBuilder<"register", 3, null>;
      register_4: AuthResponseBuilder<"register", 4, null>;
      register_5: AuthResponseBuilder<"register", 5, null>;
      register_6: AuthResponseBuilder<"register", 6, null>;
      register_7: AuthResponseBuilder<"register", 7, null>;
      register_9: AuthResponseBuilder<"register", 9, null, number>;
    }
  >;
  login: AuthMethodBuilder<
    "login",
    User<"login" | "password">,
    {
      login_0: AuthResponseBuilder<
        "login",
        0,
        User<"accessToken" | "refreshToken">
      >;
      login_1: AuthResponseBuilder<"login", 1, null>;
      login_2: AuthResponseBuilder<"login", 2, null>;
      login_3: AuthResponseBuilder<"login", 3, null>;
      login_4: AuthResponseBuilder<"login", 4, null>;
      login_5: AuthResponseBuilder<"login", 5, null>;
      login_9: AuthResponseBuilder<"login", 9, null, number>;
    }
  >;
  logout: AuthMethodBuilder<
    "logout",
    User<"refreshToken">,
    {
      logout_0: AuthResponseBuilder<"logout", 0, null>;
      logout_1: AuthResponseBuilder<"logout", 1, null>;
      logout_2: AuthResponseBuilder<"logout", 2, null>;
      logout_3: AuthResponseBuilder<"logout", 3, null>;
      logout_4: AuthResponseBuilder<"logout", 4, null>;
      logout_9: AuthResponseBuilder<"logout", 9, null, number>;
    }
  >;
  refresh: AuthMethodBuilder<
    "refresh",
    User<"refreshToken">,
    {
      refresh_0: AuthResponseBuilder<"refresh", 0, User<"accessToken">>;
      refresh_1: AuthResponseBuilder<"refresh", 1, null>;
      refresh_2: AuthResponseBuilder<"refresh", 2, null>;
      refresh_3: AuthResponseBuilder<"refresh", 3, null>;
      refresh_4: AuthResponseBuilder<"refresh", 4, null>;
      refresh_9: AuthResponseBuilder<"refresh", 9, null, number>;
    }
  >;

  check: AuthMethodBuilder<
    "check",
    User<"accessToken" | "refreshToken">,
    {
      check_0: AuthResponseBuilder<"check", 0, null>;
      check_1: AuthResponseBuilder<"check", 1, null>;
      check_2: AuthResponseBuilder<"check", 2, null>;
      check_3: AuthResponseBuilder<"check", 3, null>;
      check_4: AuthResponseBuilder<"check", 4, null>;
      check_5: AuthResponseBuilder<"check", 5, null>;
      check_9: AuthResponseBuilder<"check", 9, null, number>;
    }
  >;
};

export type AuthRequest<Method extends Exclude<AuthMethodStrings, "server">> =
  AuthProtocol[Method]["request"];
export type AuthResponse<Method extends Exclude<AuthMethodStrings, "server">> =
  AuthProtocol[Method]["responses"][keyof AuthProtocol[Method]["responses"]];
