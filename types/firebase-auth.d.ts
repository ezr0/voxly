// `firebase/auth`'s published package.json "exports" map lists a top-level
// "types" condition ahead of the "react-native" condition, so TypeScript
// always resolves the web-only type declarations even on React Native,
// even though the react-native build (used by Metro at runtime) does
// export `getReactNativePersistence`. This augmentation restores the
// missing type so `lib/firebase.ts` compiles without affecting runtime
// behavior.
import type { Persistence } from "@firebase/auth";

declare module "firebase/auth" {
  interface ReactNativeAsyncStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }

  export function getReactNativePersistence(
    storage: ReactNativeAsyncStorage,
  ): Persistence;
}
