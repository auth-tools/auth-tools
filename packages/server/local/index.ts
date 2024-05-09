import { UserData } from "@auth-tools/base";
import { Logger } from "@auth-tools/logger";
import { AuthServer, AuthServerConfig } from "@auth-tools/server";

const Users: UserData[] = [];
const Tokens: string[] = [];

const logger = new Logger();

const authServerConfig: AuthServerConfig = {
  secrets: {
    accessToken: "SECRET",
    refreshToken: "SECRET",
  },
};

const authServer = new AuthServer(authServerConfig, logger.log);

authServer.use("getUserByMail", ({ email }) => {
  const user = Users.find((usr) => usr.email === email) || null;
  return { serverError: false, user };
});

authServer.use("getUserByName", ({ username }) => {
  const user = Users.find((usr) => usr.username === username) || null;
  return { serverError: false, user };
});

authServer.use("storeUser", ({ user }) => {
  Users.push(user);
  return { serverError: false };
});

authServer.use("checkToken", ({ refreshToken }) => {
  const exists = Tokens.includes(refreshToken);
  return { serverError: false, exists };
});

authServer.use("storeToken", ({ refreshToken }) => {
  Tokens.push(refreshToken);
  return { serverError: false };
});

authServer.use("deleteToken", ({ refreshToken }) => {
  Tokens.splice(Tokens.indexOf(refreshToken), 1);
  return { serverError: false };
});

authServer.use("validateMail", ({ email }) => {
  const isValid = email.includes("@");
  return { serverError: false, isValid };
});

authServer.use("validatePassword", ({ password }) => {
  const isValid = password.length >= 8;
  return { serverError: false, isValid };
});

authServer.use("hashPassword", ({ password }) => {
  const hashedPassword = password.split("").reverse().join("");
  return { serverError: false, hashedPassword };
});

authServer.use("checkPassword", ({ password, hashedPassword }) => {
  const matches = password.split("").reverse().join("") === hashedPassword;
  return { serverError: false, matches };
});

authServer.use("genId", ({}) => {
  const id = Users.length.toString();
  return { serverError: false, id };
});
