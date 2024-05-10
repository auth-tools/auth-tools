import { AuthInternal } from "@auth-tools/base";
import {
  AuthServerConfig,
  AuthServerInterceptEvents,
  AuthServerMethod,
  AuthServerUseEvents,
} from "../auth";
import { authError, authServerError } from "../senders";
import { decodeToken } from "../tokenUtils";

//create validate method
export function createValidate(
  internal: AuthInternal<
    AuthServerConfig,
    AuthServerUseEvents,
    AuthServerInterceptEvents
  >
): AuthServerMethod<"validate"> {
  return async ({ accessToken }) => {
    //validate method is disabled
    if (internal.config.methods.validate === "disabled") {
      internal.log("debug", "The validate method is disabled.");
      return authError<"validate", 1>(1, "The validation method is disabled.");
    }

    try {
      if (!accessToken) {
        internal.log("debug", 'The "accessToken" is missing.');
        return authError<"validate", 2>(2, 'The "accessToken" is missing.');
      }

      const decodeAccessToken = decodeToken(
        accessToken,
        internal.config.secrets.accessToken
      );

      if (!decodeAccessToken.valid || !decodeAccessToken.payload) {
        internal.log("debug", 'The "accessToken" is invalid.');
        return authError<"validate", 3>(3, 'The "accessToken" is invalid.');
      }

      return {
        error: false,
        intercepted: false,
        errorType: "method",
        message: "Validation successful.",
        codes: { status: 0, intercept: 0 },
        data: { id: decodeAccessToken.payload.id },
      };
    } catch (error) {
      internal.log("warn", String(error));
      return authServerError();
    }
  };
}
