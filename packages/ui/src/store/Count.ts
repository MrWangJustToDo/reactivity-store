import { createStoreWithComponent, onMounted, onUpdated, ReactiveEffect, ref } from "reactivity-store";

import { useCount_2 } from "@/hooks/useCount";

export const Count = createStoreWithComponent({
  setup: () => {
    const count = ref(0);

    useCount_2.subscribe(
      (s) => s.data.d.current,
      () => {
        count.value = useCount_2.getReadonlyState().data.d.current;
      }
    );

    const add = () => count.value++;

    const del = () => count.value--;

    return { count, add, del };
  },
});
