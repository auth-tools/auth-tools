import { AuthInternal } from "@auth-tools/base";
import {
  AuthServerConfig,
  AuthServerInterceptEvents,
  AuthServerMethod,
  AuthServerUseEvents,
} from "../auth";
import { authError, authServerError } from "../senders";
import { decodeToken } from "../tokenUtils";

//create logout method
export function createLogout(
  internal: AuthInternal<
    AuthServerConfig,
    AuthServerUseEvents,
    AuthServerInterceptEvents
  >
): AuthServerMethod<"logout"> {
  return async ({ refreshToken }) => {
    //logout method is disabled
    if (internal.config.methods.logout === "disabled") {
      internal.log("debug", "The logout method is disabled.");
      return authError<"logout", 1>(1, "The logout method is disabled.");
    }

    try {
      if (!refreshToken) {
        internal.log("debug", 'The "refreshToken" is missing.');
        return authError<"logout", 2>(2, 'The "refreshToken" is missing.');
      }

      const decodeRefreshToken = decodeToken(
        refreshToken,
        internal.config.secrets.refreshToken
      );

      if (!decodeRefreshToken.valid || !decodeRefreshToken.payload) {
        internal.log("debug", 'The "refreshToken" is invalid.');
        return authError<"logout", 3>(3, 'The "refreshToken" is invalid.');
      }

      const checkToken = await internal.useEventCallbacks.checkToken({
        refreshToken,
      });

      if (checkToken.serverError) return authServerError();

      if (!checkToken.exists) {
        internal.log("debug", 'The "refreshToken" does not exist.');
        return authError<"logout", 4>(4, 'The "refreshToken" does not exist.');
      }

      const intercept = await internal.interceptEventCallbacks.logout({
        refreshToken,
        payload: { id: decodeRefreshToken.payload.id },
      });

      if (intercept.serverError) return authServerError();

      if (intercept.intercepted)
        return authError<"logout", 9>(
          9,
          "The logout request was intercepted.",
          intercept.interceptCode
        );

      const deleteToken = await internal.useEventCallbacks.deleteToken({
        refreshToken,
      });

      if (deleteToken.serverError) return authServerError();

      return {
        auth: {
          error: false,
          errorType: "method",
          message: "Logout successful.",
          codes: { status: 0, intercept: 0 },
        },
        data: null,
      };
    } catch (error) {
      internal.log("warn", String(error));
      return authServerError();
    }
  };
}
