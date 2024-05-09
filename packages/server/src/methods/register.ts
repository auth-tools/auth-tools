import { AuthInternal, User } from "@auth-tools/base";
import {
  AuthServerConfig,
  AuthServerInterceptEvents,
  AuthServerMethod,
  AuthServerUseEvents,
} from "../auth";
import { authError, authServerError } from "../senders";
import getUserByLogin from "../getUserByLogin";

//create register method
export function createRegister(
  internal: AuthInternal<
    AuthServerConfig,
    AuthServerUseEvents,
    AuthServerInterceptEvents
  >
): AuthServerMethod<"register"> {
  return async ({ email, username, password }) => {
    //register method is disabled
    if (internal.config.methods.register === "disabled") {
      internal.log("debug", "The registration method is disabled.");
      return authError<"register", 1>(
        1,
        "The registration method is disabled."
      );
    }

    try {
      if (!email || !username || !password) {
        internal.log(
          "debug",
          'The "email", "username" or "password" is missing.'
        );
        return authError<"register", 2>(
          2,
          'The "email", "username" or "password" is missing.'
        );
      }

      const validateMail = await internal.useEventCallbacks.validateMail({
        email,
      });

      if (validateMail.serverError) return authServerError();

      if (!validateMail.isValid) {
        internal.log("debug", 'The "email" is malformed.');
        return authError<"register", 3>(3, 'The "email" is malformed.');
      }

      const validatePassword =
        await internal.useEventCallbacks.validatePassword({
          password,
        });

      if (validatePassword.serverError) return authServerError();

      if (!validatePassword.isValid) {
        internal.log("debug", 'The "password" is too weak.');
        return authError<"register", 4>(4, 'The "password" is too weak.');
      }

      const getUserByLoginEmail = await getUserByLogin(email, internal);

      if (getUserByLoginEmail.serverError) return authServerError();

      if (getUserByLoginEmail.user) {
        if (internal.config.sensitive.logs)
          internal.log("debug", 'The "login" is already in use.');
        else internal.log("debug", 'The "email" is already in use.');
        if (internal.config.sensitive.api)
          return authError<"register", 7>(7, 'The "login" is already in use.');
        else
          return authError<"register", 5>(5, 'The "email" is already in use.');
      }

      const getUserByLoginName = await getUserByLogin(username, internal);

      if (getUserByLoginName.serverError) return authServerError();

      if (getUserByLoginName.user) {
        if (internal.config.sensitive.logs)
          internal.log("debug", 'The "login" is already in use.');
        else internal.log("debug", 'The "username" is already in use.');
        if (internal.config.sensitive.api)
          return authError<"register", 7>(7, 'The "login" is already in use.');
        else
          return authError<"register", 6>(
            6,
            'The "username" is already in use.'
          );
      }

      const hashPassword = await internal.useEventCallbacks.hashPassword({
        password,
      });

      if (hashPassword.serverError) return authServerError();

      const genId = await internal.useEventCallbacks.genId({
        email,
        username,
      });

      if (genId.serverError) return authServerError();

      const user: User<"id" | "email" | "username" | "hashedPassword"> = {
        id: genId.id,
        email,
        username,
        hashedPassword: hashPassword.hashedPassword,
      };

      const intercept = await internal.interceptEventCallbacks.register({
        user,
      });

      if (intercept.serverError) return authServerError();

      if (intercept.intercepted)
        return authError<"register", 9>(
          9,
          "The registration request was intercepted.",
          intercept.interceptCode
        );

      const storeUser = await internal.useEventCallbacks.storeUser({ user });

      if (storeUser.serverError) return authServerError();

      return {
        auth: {
          error: false,
          errorType: "method",
          message: "Registration successful.",
          codes: { status: 0, intercept: 0 },
        },
        data: { id: user.id, email: user.email, username: user.username },
      };
    } catch (error) {
      internal.log("warn", String(error));
      return authServerError();
    }
  };
}
