import { UseEventCallbacks } from "@auth-tools/base";
import { AuthClientUseEvents } from "./auth";
import { LogFunction } from "@auth-tools/logger";

//for an undefined use event
export function undefinedUseEvent<
  Event extends keyof AuthClientUseEvents,
  Return extends AuthClientUseEvents[Event]["return"]
>(
  event: Event,
  returnData: Return,
  log: LogFunction
): UseEventCallbacks<AuthClientUseEvents>[Event] {
  return (() => {
    //complain about unset use event callback
    log("error", `The use "${event}" event is not defined!`);
    return { ...returnData, error: true };
  }) as UseEventCallbacks<AuthClientUseEvents>[Event];
}
