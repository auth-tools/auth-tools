import { AuthInternal, UseEventCallbacks, User } from "@auth-tools/base";
import {
  AuthServerConfig,
  AuthServerInterceptEvents,
  AuthServerUseEvents,
} from "./auth";

export default async function (
  login: User<"login">["login"],
  internal: AuthInternal<
    AuthServerConfig,
    AuthServerUseEvents,
    AuthServerInterceptEvents
  >
): Promise<
  | ReturnType<UseEventCallbacks<AuthServerUseEvents>["getUserByMail"]>
  | ReturnType<UseEventCallbacks<AuthServerUseEvents>["getUserByName"]>
> {
  //get user by email with value of login
  const getUserByMail = await internal.useEventCallbacks.getUserByMail({
    email: login,
  });

  if (getUserByMail.error) return { error: true, user: null };

  //get user by name with value of login
  const getUserByName = await internal.useEventCallbacks.getUserByName({
    username: login,
  });

  if (getUserByName.error) return { error: true, user: null };

  return { error: false, user: getUserByMail.user || getUserByName.user };
}
