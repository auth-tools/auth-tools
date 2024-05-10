import AuthServer, { AuthServerMethod } from "@auth-tools/server";
import { RequestHandler } from "express";

const HTTP_CODES = {
  1: 403,
  2: 400,
  3: 403,
  5: 500,
};

export function validate(authServer: AuthServer): RequestHandler {
  return async (req, res, next) => {
    const authHeader = req.get("authorization");
    const accessToken = authHeader && authHeader.split(" ")[1];

    const response = await (
      authServer.methods.validate as AuthServerMethod<"validate">
    )({ accessToken });

    if (response.error) {
      return res.status(HTTP_CODES[response.codes.status]).json(response);
    }

    res.locals.payload = { id: response.data.id };

    next();
  };
}
