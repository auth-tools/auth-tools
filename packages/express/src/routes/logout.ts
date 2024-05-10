import AuthServer, { AuthServerMethod } from "@auth-tools/server";
import { RequestHandler } from "express";

const HTTP_CODES = {
  0: 200,
  1: 403,
  2: 400,
  3: 403,
  4: 404,
  9: 403,
};

export function logout(authServer: AuthServer): RequestHandler {
  return async (req, res) => {
    const response = await (
      authServer.methods.logout as AuthServerMethod<"logout">
    )(req.body);

    const httpCodes =
      response.errorType === "server" ? 500 : HTTP_CODES[response.codes.status];

    res.status(httpCodes).json(response);
  };
}
