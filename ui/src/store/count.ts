import { createStore, onBeforeMount, reactive, ref } from "v-r-store";

export const useCount = createStore(() => {
  const countRef = ref(0);
  const reactiveObj = reactive({ a: { b: 1 } });
  const changeRef = (v: number) => (countRef.value = v);
  const changeReactiveField = (v: number) => (reactiveObj.a.b = v);
  onBeforeMount(() => {
    console.log("component will mount");
  });
  return { countRef, changeRef, reactiveObj, changeReactiveField };
});
