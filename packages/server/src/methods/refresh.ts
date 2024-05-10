import { AuthInternal } from "@auth-tools/base";
import {
  AuthServerConfig,
  AuthServerInterceptEvents,
  AuthServerMethod,
  AuthServerUseEvents,
} from "../auth";
import { authError, authServerError } from "../senders";
import { decodeToken, generateToken } from "../tokenUtils";

//create refresh method
export function createRefresh(
  internal: AuthInternal<
    AuthServerConfig,
    AuthServerUseEvents,
    AuthServerInterceptEvents
  >
): AuthServerMethod<"refresh"> {
  return async ({ refreshToken }) => {
    //refresh method is disabled
    if (internal.config.methods.refresh === "disabled") {
      internal.log("debug", "The refresh method is disabled.");
      return authError<"refresh", 1>(1, "The refresh method is disabled.");
    }

    try {
      if (!refreshToken) {
        internal.log("debug", 'The "refreshToken" is missing.');
        return authError<"refresh", 2>(2, 'The "refreshToken" is missing.');
      }

      const decodeRefreshToken = decodeToken(
        refreshToken,
        internal.config.secrets.refreshToken
      );

      if (!decodeRefreshToken.valid || !decodeRefreshToken.payload) {
        internal.log("debug", 'The "refreshToken" is invalid.');
        return authError<"refresh", 3>(3, 'The "refreshToken" is invalid.');
      }

      const checkToken = await internal.useEventCallbacks.checkToken({
        refreshToken,
      });

      if (checkToken.error) return authServerError();

      if (!checkToken.exists) {
        internal.log("debug", 'The "refreshToken" does not exist.');
        return authError<"refresh", 4>(4, 'The "refreshToken" does not exist.');
      }

      const intercept = await internal.interceptEventCallbacks.refresh({
        refreshToken,
        payload: { id: decodeRefreshToken.payload.id },
      });

      if (intercept.error) return authServerError();

      if (intercept.intercepted)
        return authError<"refresh", 9>(
          9,
          "The refresh request was intercepted.",
          intercept.interceptCode
        );

      const accessToken = generateToken(
        { id: decodeRefreshToken.payload.id },
        internal.config.secrets.accessToken,
        internal.config.expiresIn
      );

      return {
        error: false,
        intercepted: false,
        errorType: "method",
        message: "Refresh successful.",
        codes: { status: 0, intercept: 0 },
        data: { accessToken },
      };
    } catch (error) {
      internal.log("warn", String(error));
      return authServerError();
    }
  };
}
