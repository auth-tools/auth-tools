import {
  InterceptEventCallback,
  InterceptEventCallbacks,
  InterceptEvents,
  InterceptEventsDefinition,
} from "./events/intercept";
import {
  UseEventCallback,
  UseEventCallbacks,
  UseEvents,
  UseEventsDefinition,
} from "./events/use";
import { DeepRequired } from "./helpers";
import { LogFunction } from "@auth-tools/logger";

//definition of internal data of AuthBase class
export type AuthInternal<
  AuthConfig,
  ClassUseEvents extends UseEventsDefinition,
  ClassInterceptEvents extends InterceptEventsDefinition
> = {
  config: DeepRequired<AuthConfig>;
  log: LogFunction;
  useEventCallbacks: UseEventCallbacks<ClassUseEvents>;
  interceptEventCallbacks: InterceptEventCallbacks<ClassInterceptEvents>;
};

//auth base class
export class AuthBase<
  AuthConfig,
  ClassUseEvents extends UseEventsDefinition,
  ClassInterceptEvents extends InterceptEventsDefinition
> {
  //internal auth data
  public _internal: AuthInternal<
    AuthConfig,
    ClassUseEvents,
    ClassInterceptEvents
  >;

  constructor(
    config: DeepRequired<AuthConfig>,
    log: LogFunction,
    defaultUseEvents: UseEventCallbacks<ClassUseEvents>,
    defaultInterceptEvents: InterceptEventCallbacks<ClassInterceptEvents>
  ) {
    //sets _internal
    this._internal = {
      config: config,
      log: log,
      useEventCallbacks: defaultUseEvents,
      interceptEventCallbacks: defaultInterceptEvents,
    };
  }

  //sets a use event
  public use<UseEventName extends keyof UseEvents<ClassUseEvents>>(
    event: UseEventName,
    callback: UseEventCallback<ClassUseEvents, UseEventName>
  ): void {
    this._internal.useEventCallbacks[event] = callback;
  }

  //sets a intercept event
  public intercept<
    InterceptEventName extends keyof InterceptEvents<ClassInterceptEvents>
  >(
    event: InterceptEventName,
    callback: InterceptEventCallback<ClassInterceptEvents, InterceptEventName>
  ): void {
    this._internal.interceptEventCallbacks[event] = callback;
  }
}
