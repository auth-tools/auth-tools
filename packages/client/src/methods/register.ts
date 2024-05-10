import { AuthInternal } from "@auth-tools/base";
import {
  AuthClientConfig,
  AuthClientConnector,
  AuthClientMethod,
  AuthClientUseEvents,
} from "../auth";

//create register method
export function createRegister(
  internal: AuthInternal<AuthClientConfig, AuthClientUseEvents, {}>
): AuthClientMethod<"register"> {
  return async ({ email, username, password }) => {
    const registerResponse = await (
      internal.config.connector as AuthClientConnector<"register">
    )("register", { email, username, password });

    return registerResponse;
  };
}
