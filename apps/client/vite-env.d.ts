/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom/vitest" />

declare module '*.css?inline' {
  const cssText: string;
  export default cssText;
}
