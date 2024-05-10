import { AuthServer } from "@auth-tools/server";
import { RequestHandler, Router } from "express";
import { register } from "./routes/register";
import { login } from "./routes/login";
import { logout } from "./routes/logout";
import { refresh } from "./routes/refresh";
import { check } from "./routes/check";
import { validate } from "./middleWares/validate";

export function authExpress(authServer: AuthServer): {
  middleWare: { validate?: RequestHandler };
  router: Router;
} {
  //create router
  const router = Router();

  //add routes
  if (authServer._internal.config.methods.register !== "removed") {
    router.post("/register", register(authServer));
  }

  if (authServer._internal.config.methods.login !== "removed") {
    router.post("/login", login(authServer));
  }

  if (authServer._internal.config.methods.logout !== "removed") {
    router.post("/logout", logout(authServer));
  }

  if (authServer._internal.config.methods.refresh !== "removed") {
    router.post("/refresh", refresh(authServer));
  }

  if (authServer._internal.config.methods.check !== "removed") {
    router.post("/check", check(authServer));
  }

  return {
    middleWare: {
      validate:
        authServer._internal.config.methods.validate !== "removed"
          ? undefined
          : validate(authServer),
    },
    router,
  };
}
