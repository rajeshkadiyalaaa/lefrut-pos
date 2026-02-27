declare global {
  interface Window {
    api?: {
      print: (options?: unknown) => Promise<boolean>;
    };
  }
}

export {};
