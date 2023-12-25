/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createState,
  createStoreWithComponent,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  withActions,
  withPersist,
  withNamespace,
  ref,
  createStore,
} from "..";

const useCount = createState(
  withPersist(
    withActions(
      withPersist(() => ({ count: { data: 1 } }), { key: "lllll" }),
      { generateActions: (s) => ({ del: () => s.count.data--, kk: () => "ll" }) }
    ),
    { key: "llllll" }
  ),
  {
    withActions: (s) => ({ add: () => s.count.data++, del: () => 1 }),
    withPersist: "1",
  }
);

const useA = createState(() => ({ a: 1 }));

const useFf = createStore(() => {
  const vvv = ref(0);

  return { vvv };
});

const h = useFf((s) => s);

const i = useCount((s) => s);

const useCount_v2 = createState(
  withActions(
    withPersist(
      withNamespace(
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
        { namespace: "kkk" }
      ),
      { key: "llllll" }
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
    withActions: (s) => ({ ll: () => s.count++ }),
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
  { withActions: (state) => ({ add: () => state.count++, del: () => state.count-- }), withPersist: "foo" }
);

useCountG.getActions();

useCountG.getReactiveState().count;

const useHH1 = createState(
  withActions(
    withNamespace(
      withNamespace(() => ({ data: [] as number[] }), { namespace: "122" }),
      { namespace: "111" }
    ),
    { generateActions: (s) => ({ del: () => s.data.pop() }) }
  ),
  // {
  //   // withActions: (state) => ({ add: () => state.data.push(100) }),
  //   // withNamespace: "1111",
  // }
  {
    withActions: (s) => ({add: () => s.data.push(199)}),
    withPersist: '111',
    withDeepSelector: true,
    withNamespace: '2222'
  }
);

useHH1.getActions()

useHH1.getReactiveState()

const useHH2 = createState(() => ({ data: [] as number[] }), {
  withActions: (state) => ({ add: () => state.data.push(100) }),
  withPersist: "foo",
  withDeepSelector: true,
  withNamespace: "1111",
});

useHH2.getActions()

useHH2.getReactiveState()
