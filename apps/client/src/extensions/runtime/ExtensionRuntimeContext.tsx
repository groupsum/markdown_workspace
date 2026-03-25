import React from 'react';
import type { ExtensionRuntime } from '@mdwrk/extension-runtime';

const ExtensionRuntimeContext = React.createContext<ExtensionRuntime | null>(null);

export interface ExtensionRuntimeContextProviderProps extends React.PropsWithChildren {
  readonly runtime: ExtensionRuntime;
}

export const ExtensionRuntimeContextProvider: React.FC<ExtensionRuntimeContextProviderProps> = ({ runtime, children }) => (
  <ExtensionRuntimeContext.Provider value={runtime}>{children}</ExtensionRuntimeContext.Provider>
);

export const useExtensionRuntime = (): ExtensionRuntime => {
  const value = React.useContext(ExtensionRuntimeContext);
  if (!value) {
    throw new Error('useExtensionRuntime must be used within ExtensionRuntimeProvider');
  }
  return value;
};
