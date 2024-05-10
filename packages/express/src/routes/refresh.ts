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

export function refresh(authServer: AuthServer): RequestHandler {
  return async (req, res) => {
    const response = await (
      authServer.methods.refresh as AuthServerMethod<"refresh">
    )(req.body);

    const httpCodes =
      response.errorType === "server" ? 500 : HTTP_CODES[response.codes.status];

    res.status(httpCodes).json(response);
  };
}
