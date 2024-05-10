import { AuthInternal } from "@auth-tools/base";
import {
  AuthClientConfig,
  AuthClientConnector,
  AuthClientMethod,
  AuthClientUseEvents,
} from "../auth";

//create validate method
export function createValidate(
  internal: AuthInternal<AuthClientConfig, AuthClientUseEvents, {}>
): AuthClientMethod<"validate"> {
  return async ({ accessToken }) => {
    const validateResponse = await (
      internal.config.connector as AuthClientConnector<"validate">
    )("validate", { accessToken });

    return validateResponse;
  };
}
