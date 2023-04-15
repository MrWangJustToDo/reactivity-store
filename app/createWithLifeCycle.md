# Create Store with LifeCycle

## Description

So `Vue` have a lifeCycle function in the `setup` step, can we use it in `React`? here i create a solution can be do this.

`RStore` provide some function like: `createStoreWithComponent`、`onBeforeMount`、`onMounted`、`onBeforeUpdate`、`onUpdated`、`onBeforeUnmount`、`onUnmounted`, all of this lifeCycle function just like `Vue` but work in `React`

## Code Example

```tsx
import { createStoreWithComponent, ref, reactive, onMounted, onBeforeUpdate, onBeforeUnmount } from "r-store";

// just like `Vue` api
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
  import CreateWithComponent from '@theme/components/createWithComponent.vue'
</script>

<CreateWithComponent />
