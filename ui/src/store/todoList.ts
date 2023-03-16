import { createStore, ref } from "v-r-store";

export const useTodoList = createStore(() => {
  const countRef = ref(0);
  const changeRef = (v: number) => (countRef.value = v);
  return { countRef, changeRef };
});
