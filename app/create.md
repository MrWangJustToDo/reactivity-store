# How to create a Store

## Description

The `RStore` package export a `createStore` function which can be used to create a store.

Only the `createStore` is not enough, we also need make the data have the ability to be responsive, so the `RStore` also export function like `ref`、`reactive`、`computed`... which provide by [`@vue/reactivity`](https://www.npmjs.com/package/@vue/reactivity),

The hook which return by `createStore` can be used in the `React` component just like a custom hook, and this hook also could expect a `selector` function which can be pick a part of state from the store.

## Code Example

```tsx
import { createStore, ref, reactive } from "r-store";

// here we create a `count` store
const useCount = createStore(() => {
  const reactiveCount = reactive({ count: 0 });

  return { reactiveCount };
});

const App = () => {
  const reactiveObj = useCount((state) => state.reactiveCount);

  return (
    <div>
      <p>React Reactive Count</p>
      <p>{reactiveObj.count}</p>
      <button onClick={() => reactiveObj.count++}>Add</button>
    </div>
  );
};
```

::: warning
I recommend provide a memo select to the hook which pick the state if we do not need all of the store state, like:

```tsx
const App = () => {
  const reactiveObj = useCount(useCallback((state) => state.reactiveCount, []));

  return (
    <div style={containerStyle}>
      <p>React Reactive Count</p>
      <p style={{ color: "red" }}>{reactiveObj.count}</p>
      <button onClick={() => reactiveObj.count++} style={buttonStyle}>
        Add
      </button>
    </div>
  );
};
```

:::

## Online Example

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import * as React from 'react';
  import * as ReactDOM from 'react-dom/client';
  import * as Babel from '@babel/standalone';
  import * as RStore from 'r-store';

  const jsxString = `
  const useCount = RStore.createStore(() => {
    const reactiveCount = RStore.reactive({count: 0});

  return { reactiveCount };
  });

  const App = () => {
    const reactiveObj = useCount(state => state.reactiveCount);

    return <div className='container'>
      <p>React Reactive Count</p>
      <p style={{color: 'red'}}>{ reactiveObj.count }</p>
      <button className='button' onClick={() => reactiveObj.count++}>Add Button</button>
    </div>
  };

  const app1 = ReactDOM.createRoot(document.querySelector('#react-root-1'));

  app1.render(<App />);
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

<div id='react-root-1'>

</div>

<style>
  #react-root-1 .container {
    padding: 20px;
    overflow: hidden;
    border-radius: 4px;
    background-color: RGBA(100, 100, 100, .4);
  }

  #react-root-1 .button {
    border: 1px solid rgba(100, 100, 100, .8);
    padding: 6px 10px;
    border-radius: 4px;
  }
</style>
