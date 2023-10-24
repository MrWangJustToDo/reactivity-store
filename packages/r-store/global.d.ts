declare global {
  const __DEV__: boolean;
  const __VERSION__: string;

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
    }
  }

  interface Window {
    __store__: Set<any>
    __REDUX_DEVTOOLS_EXTENSION__: any
  }
}

export {};
