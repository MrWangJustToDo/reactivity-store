import { createStoreWithComponent, ref } from "reactivity-store";

export const Count = createStoreWithComponent({
  setup: () => {
    const count = ref(0);

    const add = () => count.value++;

    const del = () => count.value--;

    return { count, add, del };
  },
});
