import AuthServer, { AuthServerMethod } from "@auth-tools/server";
import { RequestHandler } from "express";

const HTTP_CODES = {
  0: 201,
  1: 403,
  2: 400,
  3: 404,
  4: 403,
  5: 403,
  9: 403,
};

export function login(authServer: AuthServer): RequestHandler {
  return async (req, res) => {
    const response = await (
      authServer.methods.login as AuthServerMethod<"login">
    )(req.body);

    const httpCodes =
      response.errorType === "server" ? 500 : HTTP_CODES[response.codes.status];

    res.status(httpCodes).json(response);
  };
}
