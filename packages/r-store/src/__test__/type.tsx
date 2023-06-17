/* eslint-disable @typescript-eslint/no-unused-vars */
import { createState, createStoreWithComponent, onBeforeUnmount, onBeforeUpdate, onMounted, withActions, withPersist, ref } from "..";

const useCount = createState(() => ({ count: { data: 1 } }));

const useCount_v2 = createState(
  withActions(() => ({ count: 1, name: "haha" }), {
    generateActions: (state) => {
      return {
        add: () => state.count++,
        del: () => {
          state.count--;
        },
      };
    },
  })
);

const useCount_v3 = createState(
  withPersist(
    withActions(
      () => {
        const data = { count: 0 };

        return data;
      },
      { generateActions: (state) => ({ add: () => state.count++, del: () => state.count-- }) }
    ),
    { key: "foo" }
  )
);

// const { count, add, del } = useCount_v2();

const { count, add, del } = useCount_v3();

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
