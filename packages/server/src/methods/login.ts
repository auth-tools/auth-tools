import { AuthInternal } from "@auth-tools/base";
import {
  AuthServerConfig,
  AuthServerInterceptEvents,
  AuthServerMethod,
  AuthServerUseEvents,
} from "../auth";
import { authError, authServerError } from "../senders";
import getUserByLogin from "../getUserByLogin";
import { TokenPayload, generateToken } from "../tokenUtils";

//create login method
export function createLogin(
  internal: AuthInternal<
    AuthServerConfig,
    AuthServerUseEvents,
    AuthServerInterceptEvents
  >
): AuthServerMethod<"login"> {
  return async ({ login, password }) => {
    //login method is disabled
    if (internal.config.methods.login === "disabled") {
      internal.log("debug", "The login method is disabled.");
      return authError<"login", 1>(1, "The login method is disabled.");
    }

    try {
      if (!login || !password) {
        internal.log(
          "debug",
          'The "login" ("email" or "username") or "password" is missing.'
        );
        return authError<"login", 2>(
          2,
          'The "login" ("email" or "username") or "password" is missing.'
        );
      }

      const getUserByLoginLogin = await getUserByLogin(login, internal);

      if (getUserByLoginLogin.error) return authServerError();

      if (!getUserByLoginLogin.user) {
        if (internal.config.sensitive.logs)
          internal.log(
            "debug",
            'The user was not found or the "password" is incorrect.'
          );
        else internal.log("debug", "The user was not found.");
        if (internal.config.sensitive.api)
          return authError<"login", 5>(
            5,
            'The user was not found or the "password" is incorrect.'
          );
        else return authError<"login", 3>(3, "The user was not found.");
      }

      const checkPassword = await internal.useEventCallbacks.checkPassword({
        password: password,
        hashedPassword: getUserByLoginLogin.user.hashedPassword,
      });

      if (checkPassword.error) return authServerError();

      if (!checkPassword.matches) {
        if (internal.config.sensitive.logs)
          internal.log(
            "debug",
            'The user was not found or the "password" is incorrect.'
          );
        else internal.log("debug", 'The "password" is incorrect.');
        if (internal.config.sensitive.api)
          return authError<"login", 5>(
            5,
            'The user was not found or the "password" is incorrect.'
          );
        else return authError<"login", 4>(4, 'The "password" is incorrect.');
      }

      const payload: TokenPayload = { id: getUserByLoginLogin.user.id };

      const refreshToken = generateToken(
        payload,
        internal.config.secrets.refreshToken
      );

      const accessToken = generateToken(
        payload,
        internal.config.secrets.accessToken,
        internal.config.expiresIn
      );

      const intercept = await internal.interceptEventCallbacks.login({
        user: getUserByLoginLogin.user,
        accessToken,
        refreshToken,
        payload,
      });

      if (intercept.error) return authServerError();

      if (intercept.intercepted)
        return authError<"login", 9>(
          9,
          "The login request was intercepted.",
          intercept.interceptCode
        );

      const storeToken = await internal.useEventCallbacks.storeToken({
        refreshToken,
      });

      if (storeToken.error) return authServerError();

      return {
        error: false,
        intercepted: false,
        errorType: "method",
        message: "Login successful.",
        codes: { status: 0, intercept: 0 },
        data: { accessToken, refreshToken },
      };
    } catch (error) {
      internal.log("warn", String(error));
      return authServerError();
    }
  };
}
