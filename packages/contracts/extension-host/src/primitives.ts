export type MaybePromise<T> = T | Promise<T>;

export interface Disposable {
  dispose(): void;
}

export type Unsubscribe = Disposable;

export interface JsonObject {
  readonly [key: string]: JsonValue;
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | readonly JsonValue[];
