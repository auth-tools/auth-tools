import { Promisify } from "../index";

//definition for a intercept event (only used for auto completion with extends)
type InterceptEventDefinition<Data extends {} = {}> = {
  data: Data;
};

//definition for intercept events (only used for auto completion with extends)
export type InterceptEventsDefinition = {
  [InterceptEventName: string]: InterceptEventDefinition;
};

//data for an intercept event
type InterceptEvent<ClassInterceptEvents extends InterceptEventDefinition> = {
  data: ClassInterceptEvents["data"];
  return: {
    error?: boolean;
    intercepted: boolean;
    interceptCode: number;
  };
};

//all intercept events
export type InterceptEvents<
  ClassInterceptEvents extends InterceptEventsDefinition
> = {
  [InterceptEventName in keyof ClassInterceptEvents]: InterceptEvent<
    ClassInterceptEvents[InterceptEventName]
  >;
};

//constructed callback for intercept event
export type InterceptEventCallback<
  ClassInterceptEvents extends InterceptEventsDefinition,
  InterceptEventName extends keyof InterceptEvents<ClassInterceptEvents>
> = (
  data: InterceptEvents<ClassInterceptEvents>[InterceptEventName]["data"]
) => Promisify<
  InterceptEvents<ClassInterceptEvents>[InterceptEventName]["return"]
>;

//all callbacks for intercept events
export type InterceptEventCallbacks<
  ClassInterceptEvents extends InterceptEventsDefinition
> = {
  [InterceptEventName in keyof InterceptEvents<ClassInterceptEvents>]: InterceptEventCallback<
    ClassInterceptEvents,
    InterceptEventName
  >;
};
