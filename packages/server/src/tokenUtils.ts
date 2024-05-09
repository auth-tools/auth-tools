import { User } from "@auth-tools/base";
import { sign, verify } from "jsonwebtoken";

//payload of the token based on User type
//id only, because username and email could change
export type TokenPayload = User<"id">;

//generare an access- or refreshToken
export function generateToken(
  payload: TokenPayload,
  secret: string,
  expiresIn?: number
) {
  //gemerate (sign) a token with the payload from secret
  return sign(
    payload,
    secret,
    //add expiresIn flag when given (only used for accessTokens)
    expiresIn ? { expiresIn: expiresIn } : undefined
  );
}

//decode the payload of a token (also verify it is not modified)
export function decodeToken(
  token: string,
  secret: string
): { valid: boolean; payload: TokenPayload | null } {
  try {
    //decrypt the token with secret
    const data = verify(token, secret) as TokenPayload;
    return { valid: true, payload: { id: data.id } };
  } catch {
    //return unvalid, when token decryption failed
    return { valid: false, payload: null };
  }
}
