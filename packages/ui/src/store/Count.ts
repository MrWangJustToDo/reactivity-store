import { createStoreWithComponent, ReactiveEffect, ref } from "reactivity-store";

import { useCount_2 } from "@/hooks/useCount";

export const Count = createStoreWithComponent({
  setup: () => {
    const count = ref(0);

    new ReactiveEffect(() => useCount_2.getFinalState().data.d.current.value, () => {
      count.value = useCount_2.getFinalState().data.d.current.value;
    }).run();

    const add = () => count.value++;

    const del = () => count.value--;

    return { count, add, del };
  },
});
