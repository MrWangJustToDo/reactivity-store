import { ref, createStoreWithComponent, onMounted, onUpdated, ReactiveEffect, onUnmounted, onBeforeUpdate } from "reactivity-store";

import { useCount_2 } from "@/hooks/useCount";

export const Count = createStoreWithComponent({
  setup: () => {
    const count = ref(0);

    let unsubscribe: Function;

    onMounted(() => {
      console.log("subscribe");
      unsubscribe = useCount_2.subscribe(
        (s) => s.data.d.current,
        () => {
          count.value = useCount_2.getReadonlyState().data.d.current;
          console.log('subscribe', count.value);
        }
      );
    });

    onUnmounted(() => {
      console.log("unsubscribe");
      unsubscribe();
    });

    onBeforeUpdate(() => {
      console.log("beforeUpdate");
    });

    onUpdated(() => {
      console.log("updated");
    });

    const add = () => count.value++;

    const del = () => count.value--;

    return { count, add, del };
  },
});
