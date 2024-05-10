import { AuthInternal } from "@auth-tools/base";
import {
  AuthClientConfig,
  AuthClientConnector,
  AuthClientMethod,
  AuthClientUseEvents,
} from "../auth";

//create check method
export function createCheck(
  internal: AuthInternal<AuthClientConfig, AuthClientUseEvents, {}>
): AuthClientMethod<"check"> {
  return async () => {
    const getRefreshToken = await internal.useEventCallbacks.getToken({
      type: "refreshToken",
    });

    if (getRefreshToken.error) return { clientError: true, res: null };

    const getAccessToken = await internal.useEventCallbacks.getToken({
      type: "accessToken",
    });

    if (getAccessToken.error) return { clientError: true, res: null };

    const checkResponse = await (
      internal.config.connector as AuthClientConnector<"check">
    )("check", {
      accessToken: getAccessToken.token || undefined,
      refreshToken: getRefreshToken.token || undefined,
    });

    return checkResponse;
  };
}
