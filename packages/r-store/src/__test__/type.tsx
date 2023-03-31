/* eslint-disable @typescript-eslint/no-unused-vars */
import { createStoreWithComponent, onBeforeUnmount, onBeforeUpdate, onMounted, ref } from "..";

const Time = createStoreWithComponent({
  setup: () => {
    const timeRef = ref(new Date().toString());
    const updateCountRef = ref(0);

    let id;

    onMounted(() => {
      id = setInterval(() => (timeRef.value = new Date().toString()), 1000);
    });

    onBeforeUpdate(() => updateCountRef.value++);

    onBeforeUnmount(() => {
      clearInterval(id);
    });

    return { timeRef, updateCountRef };
  },
});

const setup = () => {
  const timeRef = ref(new Date().toString());
  const updateCountRef = ref(0);

  let id;

  onMounted(() => {
    id = setInterval(() => (timeRef.value = new Date().toString()), 1000);
  });

  onBeforeUpdate(() => updateCountRef.value++);

  onBeforeUnmount(() => {
    clearInterval(id);
  });

  return { timeRef, updateCountRef };
};

const Time2 = createStoreWithComponent<{ name: string }, ReturnType<typeof setup>>({
  setup,
});

const Bar = <Time>{({ timeRef, updateCountRef }) => <div>123</div>}</Time>;

const Baz = <Time children={({ timeRef, updateCountRef }) => <div></div>} />;

const Bar2 = ({ name }: { name: string }) => <Time2 name={name}>{({ name, timeRef, updateCountRef }) => <div>123</div>}</Time2>;
