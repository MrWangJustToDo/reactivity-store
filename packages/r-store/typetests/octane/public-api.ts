import { configureEnv, createStore, ref, type EnvConfigOptions, type Ref, type UseSelectorWithStore } from "reactivity-store/octane";

const envOptions: Partial<EnvConfigOptions> = { allowNonBrowserUpdates: true };
configureEnv(envOptions);

const count: Ref<number> = ref(0);
const store = createStore(() => ({ count }));
const compatible: UseSelectorWithStore<{ count: Ref<number> }> = store;
const selected: number = compatible((state) => state.count);
const readonlyCount: number = compatible.getReadonlyState().count;

void selected;
void readonlyCount;
