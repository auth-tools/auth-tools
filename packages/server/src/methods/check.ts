import { AuthInternal } from "@auth-tools/base";
import {
  AuthServerConfig,
  AuthServerInterceptEvents,
  AuthServerMethod,
  AuthServerUseEvents,
} from "../auth";
import { authError, authServerError } from "../senders";
import { decodeToken } from "../tokenUtils";

//create check method
export function createCheck(
  internal: AuthInternal<
    AuthServerConfig,
    AuthServerUseEvents,
    AuthServerInterceptEvents
  >
): AuthServerMethod<"check"> {
  return async ({ accessToken, refreshToken }) => {
    //check method is disabled
    if (internal.config.methods.check === "disabled") {
      internal.log("debug", "The check method is disabled.");
      return authError<"check", 1>(1, "The check method is disabled.");
    }

    try {
      if (!accessToken || !refreshToken) {
        internal.log(
          "debug",
          'The "accessToken" or "refreshToken" is missing.'
        );
        return authError<"check", 2>(
          2,
          'The "accessToken" or "refreshToken" is missing.'
        );
      }

      const decodeRefreshToken = decodeToken(
        refreshToken,
        internal.config.secrets.refreshToken
      );

      if (!decodeRefreshToken.valid || !decodeRefreshToken.payload) {
        internal.log("debug", 'The "refreshToken" is invalid.');
        return authError<"check", 3>(3, 'The "refreshToken" is invalid.');
      }

      const checkToken = await internal.useEventCallbacks.checkToken({
        refreshToken,
      });

      if (checkToken.error) return authServerError();

      if (!checkToken.exists) {
        internal.log("debug", 'The "refreshToken" does not exist.');
        return authError<"check", 4>(4, 'The "refreshToken" does not exist.');
      }

      const decodeAccessToken = decodeToken(
        accessToken,
        internal.config.secrets.accessToken
      );

      if (!decodeAccessToken.valid || !decodeAccessToken.payload) {
        internal.log("debug", 'The "accessToken" is invalid.');
        return authError<"check", 5>(5, 'The "accessToken" is invalid.');
      }

      const intercept = await internal.interceptEventCallbacks.check({
        accessToken,
        refreshToken,
        payload: { id: decodeAccessToken.payload.id },
      });

      if (intercept.error) return authServerError();

      if (intercept.intercepted)
        return authError<"check", 9>(
          9,
          "The check request was intercepted.",
          intercept.interceptCode
        );

      return {
        error: false,
        intercepted: false,
        errorType: "method",
        message: "Check successful.",
        codes: { status: 0, intercept: 0 },
        data: null,
      };
    } catch (error) {
      internal.log("warn", String(error));
      return authServerError();
    }
  };
}
