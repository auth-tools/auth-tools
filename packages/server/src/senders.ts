import { AuthMessages, AuthProtocol, AuthResponse } from "@auth-tools/base";

export function authError<
  Method extends keyof AuthProtocol,
  StatusCode extends number
>(
  statusCode: StatusCode,
  message: AuthMessages[`${Method}_${StatusCode}`],
  interceptCode: number = 0
): AuthResponse<Method> {
  return {
    error: true,
    intercepted: interceptCode === 0 ? false : true,
    errorType: "method",
    message: message,
    codes: {
      status: statusCode,
      intercept: interceptCode,
    },
    data: null,
  } as AuthResponse<Method>;
}

export function authServerError(): AuthProtocol[keyof AuthProtocol]["responses"]["server_5"] {
  return {
    error: true,
    intercepted: false,
    errorType: "server",
    message: "An error occurred on the server. Please try again later.",
    codes: { status: 5, intercept: 0 },
    data: null,
  };
}
