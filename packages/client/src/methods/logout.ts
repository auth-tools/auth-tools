import { AuthInternal } from "@auth-tools/base";
import {
  AuthClientConfig,
  AuthClientConnector,
  AuthClientMethod,
  AuthClientUseEvents,
} from "../auth";

//create logout method
export function createLogout(
  internal: AuthInternal<AuthClientConfig, AuthClientUseEvents, {}>
): AuthClientMethod<"logout"> {
  return async () => {
    const getRefreshToken = await internal.useEventCallbacks.getToken({
      type: "refreshToken",
    });

    if (getRefreshToken.error || getRefreshToken.token === null)
      return { clientError: true, res: null };

    const logoutResponse = await (
      internal.config.connector as AuthClientConnector<"logout">
    )("logout", { refreshToken: getRefreshToken.token });

    if (!logoutResponse.clientError && !logoutResponse.res.error) {
      internal.useEventCallbacks.deleteToken({
        type: "accessToken",
      });
      internal.useEventCallbacks.deleteToken({
        type: "refreshToken",
      });
    }

    return logoutResponse;
  };
}
