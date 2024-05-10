import { AuthInternal } from "@auth-tools/base";
import {
  AuthClientConfig,
  AuthClientConnector,
  AuthClientMethod,
  AuthClientUseEvents,
} from "../auth";

//create login method
export function createLogin(
  internal: AuthInternal<AuthClientConfig, AuthClientUseEvents, {}>
): AuthClientMethod<"login"> {
  return async ({ login, password }) => {
    const loginResponse = await (
      internal.config.connector as AuthClientConnector<"login">
    )("login", { login, password });

    if (loginResponse.clientError || loginResponse.res.error)
      return loginResponse;

    //store tokens
    internal.useEventCallbacks.storeToken({
      type: "accessToken",
      token: loginResponse.res.data.accessToken,
    });
    internal.useEventCallbacks.storeToken({
      type: "refreshToken",
      token: loginResponse.res.data.refreshToken,
    });

    return loginResponse;
  };
}
