import { Promisify } from "../index";

//definition for a use event (only used for auto completion with extends)
type UseEventDefinition<Data extends {} = {}, Return extends {} = {}> = {
  data: Data;
  return: Return;
};

//definition for use events (only used for auto completion with extends)
export type UseEventsDefinition = {
  [UseEventName: string]: UseEventDefinition;
};

//data for an use event
type UseEvent<ClassUseEvents extends UseEventDefinition> = {
  data: ClassUseEvents["data"];
  return: { error?: boolean } & ClassUseEvents["return"];
};

//all use events
export type UseEvents<ClassUseEvents extends UseEventsDefinition> = {
  [UseEventName in keyof ClassUseEvents]: UseEvent<
    ClassUseEvents[UseEventName]
  >;
};

//constructed callback for use event
export type UseEventCallback<
  ClassUseEvents extends UseEventsDefinition,
  UseEventName extends keyof UseEvents<ClassUseEvents>
> = (
  data: UseEvents<ClassUseEvents>[UseEventName]["data"]
) => Promisify<UseEvents<ClassUseEvents>[UseEventName]["return"]>;

//all callbacks for use events
export type UseEventCallbacks<ClassUseEvents extends UseEventsDefinition> = {
  [UseEventName in keyof UseEvents<ClassUseEvents>]: UseEventCallback<
    ClassUseEvents,
    UseEventName
  >;
};
