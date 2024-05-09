import { User } from "./protocol";

export type Promisify<Type> = Promise<Type> | Type;
export type DeepRequired<T> = { [K in keyof T]-?: DeepRequired<T[K]> };
export type DeepOptional<T> = { [K in keyof T]?: DeepRequired<T[K]> };
export type KeysStartingWith<Type, Str extends string> = {
  [Key in keyof Type as Key extends `${Str}_${infer _}`
    ? Key
    : never]: Type[Key];
};
export type UserData = User<"id" | "email" | "username" | "hashedPassword">;
export type Payload = User<"id">;
