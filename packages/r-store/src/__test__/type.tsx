/* eslint-disable @typescript-eslint/no-unused-vars */
import { createState, createStoreWithComponent, onBeforeUnmount, onBeforeUpdate, onMounted, withActions, withPersist, ref, createStore } from "..";

const useCount = createState(
  withActions(() => ({ count: { data: 1 } }), { generateActions: (s) => ({ del: () => s.count.data--, kk: () => "ll" }) })
  // {
  //   withActions: (s: { count: { data: number } }) => ({ add: () => s.count.data++, del: () => 1 }),
  //   withPersist: "1",
  // }
);

const useFf = createStore(() => {
  const vvv = ref(0);

  return { vvv };
});

useFf((s) => s.vvv);

useCount((s) => s);

const useCount_v2 = createState(
  withActions(
    withActions(
      withActions(() => ({ count: 1, name: "haha" }), {
        generateActions: (state) => {
          return {
            add: () => state.count++,
            del: () => {
              state.count--;
            },
            kk: () => 99,
          };
        },
      }),
      { generateActions: (s) => ({ ll: () => s.count++, add: () => 1, del: () => 1 }) }
    ),
    { generateActions: (s) => ({ mm: () => s.count-- }) }
  ),
  { withActions: (s) => ({ gg: () => s.count++ }) }
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
  ),
  {
    withActions: (s: { count: number }) => ({ ll: () => s.count++ }),
    withPersist: "11",
  }
);

const { count, add, del, ll, kk, mm, gg } = useCount_v2((s) => s);

// const { count, add, del } = useCount_v3();

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

const Time2 = createStoreWithComponent({
  setup,
});

const Bar = <Time>{({ timeRef, updateCountRef }) => <div>123</div>}</Time>;

const Baz = <Time children={({ timeRef, updateCountRef }) => <div></div>} />;

const Bar2 = ({ name }: { name: string }) => <Time2>{({ timeRef, updateCountRef }) => 123}</Time2>;

const useCountG = createState(
  () => {
    const data = { count: 0 };

    return data;
  },
  { withActions: (state: { count: number }) => ({ add: () => state.count++, del: () => state.count-- }), withPersist: "foo" }
);
