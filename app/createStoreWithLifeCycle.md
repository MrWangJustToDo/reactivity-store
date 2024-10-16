# Create Store with LifeCycle

## Description

So `Vue` have a lifeCycle function in the `setup` step, can we use it in `React`? here i create a solution can be do this.

`RStore` provide some function like: `createStoreWithComponent`、`onBeforeMount`、`onMounted`、`onBeforeUpdate`、`onUpdated`、`onBeforeUnmount`、`onUnmounted`, all of this lifeCycle function just like `Vue` but work in `React`

## Code Example

```tsx twoslash
import * as React from "react";
import { createStoreWithComponent, onMounted, onBeforeUpdate, onBeforeUnmount, ref } from "reactivity-store";

// just like `Vue` api
const Time = createStoreWithComponent({
  setup: () => {
    const timeRef = ref(new Date().toString());
    const updateCountRef = ref(0);

    let id: NodeJS.Timeout;

    onMounted(() => {
      id = setInterval(() => (timeRef.value = new Date().toString()), 1000);
    });

    onBeforeUpdate(() => updateCountRef.value++);

    onBeforeUnmount(() => {
      clearInterval(id);
    });

    return { timeRef, updateCountRef };
  },

  // also support a render function
  // render: (props&state) => jsx
});

const App = () => {
  return (
    <div>
      <Time>
        {({ timeRef, updateCountRef }) => (
          <>
            <p>React Reactive Time</p>
            <p>Time: {timeRef}</p>
            <p>UpdateCount: {updateCountRef}</p>
          </>
        )}
      </Time>
    </div>
  );
};
```

## Online Example

<script setup>
  import CreateWithComponent from '@theme/components/createStoreWithComponent.vue'
</script>

<CreateWithComponent />
