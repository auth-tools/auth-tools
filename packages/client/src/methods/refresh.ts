import { AuthInternal } from "@auth-tools/base";
import {
  AuthClientConfig,
  AuthClientConnector,
  AuthClientMethod,
  AuthClientUseEvents,
} from "../auth";

//create refresh method
export function createRefresh(
  internal: AuthInternal<AuthClientConfig, AuthClientUseEvents, {}>
): AuthClientMethod<"refresh"> {
  return async () => {
    const getRefreshToken = await internal.useEventCallbacks.getToken({
      type: "refreshToken",
    });

    if (getRefreshToken.error) return { clientError: true, res: null };

    const refreshResponse = await (
      internal.config.connector as AuthClientConnector<"refresh">
    )("refresh", { refreshToken: getRefreshToken.token || undefined });

    if (!refreshResponse.clientError && !refreshResponse.res.error) {
      internal.useEventCallbacks.storeToken({
        type: "accessToken",
        token: refreshResponse.res.data.accessToken,
      });
    }

    return refreshResponse;
  };
}
