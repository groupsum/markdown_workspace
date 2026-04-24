declare namespace React {
  interface CSSProperties { [key: string]: string | number | undefined; }
  interface FC<P = {}> {
    (props: P): any;
  }
  interface ComponentType<P = {}> {
    (props: P): any;
  }
}

declare module 'react' {
  export type ReactNode = any;
  export type CSSProperties = React.CSSProperties;
  export type FC<P = {}> = React.FC<P>;
  export type ComponentType<P = {}> = React.ComponentType<P>;
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useMemo<T>(factory: () => T, deps?: readonly unknown[]): T;
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((current: T) => T)) => void];
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: readonly unknown[]): T;
  export function useSyncExternalStore<T>(subscribe: (listener: () => void) => () => void, getSnapshot: () => T, getServerSnapshot?: () => T): T;
  const React: {
    useEffect: typeof useEffect;
    useMemo: typeof useMemo;
    useState: typeof useState;
    useCallback: typeof useCallback;
    useSyncExternalStore: typeof useSyncExternalStore;
  };
  export default React;
}

declare namespace JSX {
  interface IntrinsicAttributes {
    key?: any;
  }
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

declare module 'lucide-react' {
  import type { ComponentType } from 'react';
  export const AlertTriangle: ComponentType<any>;
  export const CheckCircle2: ComponentType<any>;
  export const ChevronsUpDown: ComponentType<any>;
  export const CircleSlash2: ComponentType<any>;
  export const Download: ComponentType<any>;
  export const Power: ComponentType<any>;
  export const PowerOff: ComponentType<any>;
  export const Sidebar: ComponentType<any>;
  export const SidebarOpen: ComponentType<any>;
  export const SplitSquareHorizontal: ComponentType<any>;
  export const Square: ComponentType<any>;
  export const Upload: ComponentType<any>;
  export const X: ComponentType<any>;
  export const AppWindow: ComponentType<any>;
  export const FileQuestion: ComponentType<any>;
  const icons: Record<string, ComponentType<any>>;
  export default icons;
}
