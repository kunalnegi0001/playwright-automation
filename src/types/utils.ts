/**
 * @fileoverview Utility type definitions and type helpers.
 * Provides TypeScript utility types for deep partial/required, async functions, JSON, etc.
 * @module types/utils
 */

// Make all properties optional recursively
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Make all properties required recursively
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// Extract promise type
export type Awaited<T> = T extends Promise<infer U> ? U : T;

// Function type helpers
export type AsyncFunction<T extends any[] = any[], R = any> = (..._args: T) => Promise<R>;
export type SyncFunction<T extends any[] = any[], R = any> = (..._args: T) => R;

// JSON types
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = {
  [key: string]: JSONValue;
};
export type JSONArray = Array<JSONValue>;

// Constructor type
export type Constructor<T = any> = new (..._args: any[]) => T;

// Nullable
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// String literal union helpers
export type StringKeys<T> = Extract<keyof T, string>;

// Object with string keys
export type StringKeyOf<T> = keyof T extends string ? keyof T : never;

// Mutable
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
