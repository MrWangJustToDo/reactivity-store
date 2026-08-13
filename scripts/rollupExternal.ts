/**
 * Keep ordinary dependencies external, but inline the React 16/17 external
 * store shim so it cannot force React into an Octane-only installation.
 */
export const generateExternal = () => (id: string) => {
  if (id.includes("use-sync-external-store")) return false;
  return id.includes("node_modules") && !id.includes("node_modules/tslib");
};
