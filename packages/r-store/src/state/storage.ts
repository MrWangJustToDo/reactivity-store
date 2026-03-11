import type { StorageAdapter } from "./tools";

/**
 * @public
 *
 * Options for creating a custom storage adapter
 */
export interface CreateStorageAdapterOptions {
  /** Read value by key, return null if not found */
  read: (key: string) => string | null;
  /** Write value by key */
  write: (key: string, value: string) => void;
  /** Remove value by key */
  remove: (key: string) => void;
}

/**
 * @public
 *
 * Creates a storage adapter for persistence
 * - Without options: creates an in-memory storage
 * - With options: creates a custom storage from read/write/remove functions
 *
 * @example
 * ```ts
 * // In-memory storage (for testing or temporary storage)
 * const memoryStorage = createStorageAdapter();
 *
 * // Node.js file-based storage
 * import * as fs from 'fs';
 * import * as path from 'path';
 *
 * const dataDir = path.join(process.cwd(), '.myapp-data');
 * fs.mkdirSync(dataDir, { recursive: true });
 *
 * const fileStorage = createStorageAdapter({
 *   read: (key) => {
 *     const file = path.join(dataDir, `${key}.json`);
 *     return fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : null;
 *   },
 *   write: (key, value) => {
 *     const file = path.join(dataDir, `${key}.json`);
 *     fs.writeFileSync(file, value, 'utf-8');
 *   },
 *   remove: (key) => {
 *     const file = path.join(dataDir, `${key}.json`);
 *     if (fs.existsSync(file)) fs.unlinkSync(file);
 *   }
 * });
 *
 * // Usage with withPersist
 * const useStore = createState(
 *   withPersist(() => ({ count: 0 }), {
 *     key: 'counter',
 *     getStorage: () => fileStorage
 *   })
 * );
 * ```
 */
export function createStorageAdapter(options?: CreateStorageAdapterOptions): StorageAdapter {
  // In-memory storage when no options provided
  if (!options) {
    const store = new Map<string, string>();
    return {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
      removeItem: (key) => store.delete(key),
    };
  }

  // Custom storage with provided callbacks
  return {
    getItem(key: string): string | null {
      try {
        return options.read(key);
      } catch {
        return null;
      }
    },
    setItem(key: string, value: string): void {
      try {
        options.write(key, value);
      } catch (e) {
        if (__DEV__) {
          console.error(`[reactivity-store/storage] failed to write: ${(e as Error).message}`);
        }
      }
    },
    removeItem(key: string): void {
      try {
        options.remove(key);
      } catch {
        void 0;
      }
    },
  };
}
