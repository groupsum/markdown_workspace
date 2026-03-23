declare module "react" {
  export interface CSSProperties {
    [key: string]: string | number | undefined;
  }

  export interface ChangeEvent<T = any> {
    currentTarget: T;
    target: T;
  }

  export interface KeyboardEvent<T = any> extends ChangeEvent<T> {
    readonly key: string;
    readonly metaKey: boolean;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    preventDefault(): void;
  }

  export interface UIEvent<T = any> extends ChangeEvent<T> {}

  export type Ref<T> = any;

  export function useState<S>(initialState: S | (() => S)): [S, (value: any) => void];
  export function useRef<T>(initialValue: T): { current: T };
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useLayoutEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useMemo<T>(factory: () => T, deps?: readonly unknown[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: readonly unknown[]): T;
  export function useImperativeHandle<T>(ref: Ref<T> | undefined, init: () => T, deps?: readonly unknown[]): void;
  export function forwardRef<T, P = {}>(render: (props: P, ref: Ref<T>) => any): any;
  export const StrictMode: any;

  export namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }

  const React: {
    useState: typeof useState;
    useRef: typeof useRef;
    useEffect: typeof useEffect;
    useLayoutEffect: typeof useLayoutEffect;
    useMemo: typeof useMemo;
    useCallback: typeof useCallback;
    useImperativeHandle: typeof useImperativeHandle;
    forwardRef: typeof forwardRef;
    StrictMode: typeof StrictMode;
  };

  export default React;
}

declare module "react/jsx-runtime" {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
