# Create Store with LifeCycle <small>( experimental )</small>

## Description

So `Vue` have a lifeCycle function in the `setup` step, can we use it in `React`? here i create a solution can be do this.

`RStore` provide some function like: `createStoreWithLifeCycle`、`onBeforeMount`、`onMounted`、`onBeforeUpdate`、`onUpdated`、`onBeforeUnmount`、`onUnmounted`, all of this lifeCycle function just like `Vue` but work in `React`

## Code Example

```tsx
import { createStoreWithLifeCycle, ref, reactive, onMounted, onBeforeUpdate, onBeforeUnmount } from "r-store";

const useTime = createStoreWithLifeCycle(() => {
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
});

const App = () => {
  const { timeRef, updateCountRef } = useTime();

  return (
    <div>
      <p>React Reactive Time</p>
      <p>Time: {timeRef}</p>
      <p>UpdateCount: {updateCountRef}</p>
    </div>
  );
};
```

## Online Example

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import * as React from 'react';
  import * as ReactDOM from 'react-dom/client';
  import * as Babel from '@babel/standalone';
  import * as RStore from 'r-store';

  const jsxString = `
  const useTime = RStore.createStoreWithLifeCycle(() => {
    const timeRef = RStore.ref(new Date().toString());
    const updateCountRef = RStore.ref(0);

    let id;

    RStore.onMounted(() => {
      id = setInterval(() => (timeRef.value = new Date().toString()), 1000);
    });

    RStore.onBeforeUpdate(() => updateCountRef.value++);

    RStore.onBeforeUnmount(() => {
      clearInterval(id);
    });

    return { timeRef, updateCountRef };
  });

  const App = () => {
    const { timeRef, updateCountRef } = useTime();

    return <div className='container'>
      <p>React Reactive Time</p>
      <p style={{color: 'red'}}>Time: { timeRef }</p>
      <p style={{color: 'red'}}>UpdateCount: { updateCountRef } </p>
    </div>
  };

  const app2 = ReactDOM.createRoot(document.querySelector('#react-root-2'));

  app2.render(<App />);
  `

  const data = Babel.transform(jsxString, {presets: ["env", "react"]})

  let appScript1;

  onMounted(() => {
    window.RStore = window.RStore || RStore;
    window.React = window.React || React;
    window.ReactDOM = window.ReactDOM || ReactDOM;
    appScript1 = document.createElement('script');
    appScript1.innerHTML = data.code;
    document.head.append(appScript1);
  });

  onUnmounted(() => {
    appScript1.remove();
  });

</script>

<div id='react-root-2'>

</div>

<style>
  #react-root-2 .container {
    padding: 20px;
    overflow: hidden;
    border-radius: 4px;
    background-color: RGBA(100, 100, 100, .4);
  }
</style>
