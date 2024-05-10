import { InterceptEventCallbacks, UseEventCallbacks } from "@auth-tools/base";
import { AuthServerInterceptEvents, AuthServerUseEvents } from "./auth";
import { LogFunction } from "@auth-tools/logger";

//for an undefined use event
export function undefinedUseEvent<
  Event extends keyof AuthServerUseEvents,
  Return extends AuthServerUseEvents[Event]["return"]
>(
  event: Event,
  returnData: Return,
  log: LogFunction
): UseEventCallbacks<AuthServerUseEvents>[Event] {
  return (() => {
    //complain about unset use event callback
    log("error", `The use "${event}" event is not defined!`);
    return { ...returnData, error: true };
  }) as UseEventCallbacks<AuthServerUseEvents>[Event];
}

//for an undefined intercept event
export function undefinedInterceptEvent<
  Event extends keyof AuthServerInterceptEvents
>(): InterceptEventCallbacks<AuthServerInterceptEvents>[Event] {
  return () => {
    return { error: false, intercepted: false, interceptCode: 0 };
  };
}
