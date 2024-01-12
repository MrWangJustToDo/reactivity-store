<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createStore, ref as _ref, computed } from 'reactivity-store';
import { createElement, KeyboardEvent, Fragment } from 'react';
import ReactDOM from 'react-dom/client';

const useTodo = createStore(() => {
  const data = _ref<{ id: number, text: string, done: boolean, edit: boolean }[]>([]);

  const mode = _ref<'all' | 'done' | 'active'>('all')

  const isAllComplete = computed(() => data.value.length > 0 && data.value.every(todo => todo.done));

  const currentShow = computed(() => mode.value === 'all' ? data.value : data.value.filter(todo => mode.value === 'done' ? todo.done : !todo.done));

  const notDoneLength = computed(() => data.value.filter(todo => !todo.done).length);

  const hasSomeItemDone = computed(() => data.value.some(todo => todo.done));

  const addTodo = (text: string) => {
    data.value = data.value.concat({ id: data.value.length + Math.random(), text, done: false, edit: false });
  }

  const removeTodo = (id: number) => {
    data.value = data.value.filter((todo) => todo.id !== id);
  }

  const editTodo = (id: number, content: string) => {
    data.value = data.value.map((todo) => {
      if (todo.id === id) {
        todo.text = content;
      }
      return todo;
    });
  }

  const enableEdit = (id: number) => {
    data.value = data.value.map((todo) => {
      if (todo.id === id) {
        todo.edit = true;
      } else {
        todo.edit = false;
      }
      return todo;
    });
  }

  const disableEdit = () => {
    data.value = data.value.map((todo) => {
      todo.edit = false;
      return todo;
    });
  }

  const toggleTodo = (id: number) => {
    data.value = data.value.map((todo) => {
      if (todo.id === id) {
        todo.done = !todo.done;
      }
      return todo;
    });
  }

  const toggleAllDone = () => {
    const isAllDone = isAllComplete.value;
    data.value = data.value.map((todo) => {
      todo.done = !isAllDone;
      return todo;
    });
  }

  const clearDone = () => {
    data.value = data.value.filter(todo => !todo.done);
  }

  const changeMode = (m: 'all' | 'active' | 'done') => {
    mode.value = m;
  }

  return { addTodo, data, removeTodo, editTodo, enableEdit, disableEdit, toggleTodo, isAllComplete, toggleAllDone, currentShow, mode, notDoneLength, hasSomeItemDone, clearDone, changeMode };
})

const divRef = ref<HTMLDivElement>();

const AllComplete = () => {
  const { isAllComplete, toggleAllDone } = useTodo();

  return createElement('span', {
    className: 'allCheck' + (isAllComplete ? ' checked' : ''), onClick: toggleAllDone
  }, '❯')
}

const Input = () => {
  const addTodo = useTodo(s => s.addTodo);

  const inputKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // @ts-ignore
      const v = e.target.value.trim();
      if (v) {
        addTodo(v);
        // @ts-ignore
        e.target.value = '';
      }
    }
  }

  return createElement('input', { autoFocus: true, type: 'text', className: 'input', placeholder: 'What needs to be done?', onKeyUp: inputKeyUp })
}

const Item = ({ item }: { item: { id: number, text: string, done: boolean, edit: boolean } }) => {
  const data = useTodo();
  return createElement('div', { className: 'inputItem' }, item.edit ? createElement('input', {
    autoFocus: true,
    type: 'text',
    value: item.text,
    className: 'input',
    onChange: e => data.editTodo(item.id, e.target.value),
    onKeyUp: e => {
      if (e.key === 'Enter') {
        data.disableEdit();
      }
    },
    onBlur: () => data.disableEdit()
  }) : createElement('div', { className: 'itemContent' },
    createElement('label', { className: 'check' + (item.done ? ' checked' : '') }, createElement('input', { type: 'checkbox', onClick: () => data.toggleTodo(item.id) })),
    createElement('p', { className: 'content', onDoubleClick: () => data.enableEdit(item.id) }, item.text, createElement('i', { className: 'close', onClick: () => data.removeTodo(item.id) })),
  ))
};

const Message = () => {
  const mode = useTodo(s => s.mode);
  const clearDone = useTodo(s => s.clearDone);
  const changeMode = useTodo(s => s.changeMode);
  const notDoneLength = useTodo(s => s.notDoneLength);
  const hasSomeItemDone = useTodo(s => s.hasSomeItemDone);
  return createElement('div', { className: 'msg', ['data-msg']: notDoneLength < 2 ? notDoneLength + ' item' : notDoneLength + ' items' }, createElement('span', { className: 'toolBtns' },
    createElement('span', { className: 'btn' + (mode === 'all' ? ' checked' : ''), onClick: () => changeMode('all') }, 'All'),
    createElement('span', { className: 'btn' + (mode === 'active' ? ' checked' : ''), onClick: () => changeMode('active') }, 'Active'),
    createElement('span', { className: 'btn' + (mode === 'done' ? ' checked' : ''), onClick: () => changeMode('done') }, 'Completed'),
  ), hasSomeItemDone && createElement('span', { className: 'clear', onClick: clearDone }, 'Clear completed'))
}

const App = () => {
  const currentShow = useTodo.useShallowSelector(s => s.currentShow);

  return createElement('div', { id: 'container' },
    createElement('div', { className: 'list' },
      createElement(AllComplete),
      createElement(Input),
      createElement('div', { className: 'listItems' }, createElement(Fragment, null, currentShow.map((item) => createElement(Item, { key: item.id, item: item }))), createElement(Message))
    ))
}

let root: ReturnType<(typeof ReactDOM)["createRoot"]> | null = null;

onMounted(() => {
  root = ReactDOM.createRoot(divRef.value as HTMLElement);

  root.render(createElement(App));
});

onBeforeUnmount(() => {
  root?.unmount();
});
</script>

<template>
  <div ref="divRef"></div>
</template>

<style>
#container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-align: center;
}

#container p {
  padding: 0;
  margin: 0;
}

#container * {
  box-sizing: border-box;
}

.list {
  display: inline-flex;
  text-align: center;
  position: relative;
  flex-direction: column;
}

.list>.input {
  width: 550px;
  padding: 16px 16px 16px 60px;
  font-size: 18px;
  border: none;
  outline: none;
  box-shadow: 0px 2px 4px 1px rgba(0, 0, 0, 0.15);
}

.input::placeholder {
  color: #ddd;
  font-style: italic;
}

.list .allCheck {
  font-size: 22px;
  transform: rotate(90deg);
  padding: 10px 27px;
  position: absolute;
  left: -13px;
  top: 8px;
  cursor: pointer;
  color: #4d4d4d;
  opacity: 0.4;
  user-select: none;
}

.list .allCheck.checked {
  opacity: 1;
}

.listItems .msg {
  position: relative;
  height: 48px;
  background-color: var(--vp-c-bg);
  z-index: 10;
  box-shadow: 0px 2px 4px 1px rgba(0, 0, 0, 0.15);
  color: rgb(119, 119, 119);
  text-align: center;
  user-select: none;
}

.listItems .msg::before {
  content: attr(data-msg) " left";
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.listItems .msg .toolBtns {
  display: inline-flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.listItems .msg .toolBtns .btn {
  cursor: pointer;
  padding: 3px 7px;
  border-radius: 3px;
  border: 1px solid transparent;
  margin: 6px;
}

.listItems .msg .toolBtns .btn:hover {
  border-color: rgba(175, 47, 47, 0.2);
}

.listItems .msg .toolBtns .btn.checked {
  border-color: rgba(175, 47, 47, 0.2);
}

.listItems .msg .clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

.listItems .msg .clear:hover {
  text-decoration: underline;
}

.listItems .inputItem {
  position: relative;
  font-size: 18px;
  width: 550px;
  background-color: var(--vp-c-bg);
  z-index: 10;
  box-shadow: 0px 2px 4px 1px rgba(0, 0, 0, 0.15);
  min-height: 60px;
}

.listItems::before,
.listItems::after {
  content: "";
  position: absolute;
  height: 40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--vp-c-bg);
  box-shadow: 0px 2px 4px 1px rgba(0, 0, 0, 0.15);
}

.listItems::before {
  z-index: 6;
  width: 98%;
  top: calc(100% - 32px);
}

.listItems::after {
  z-index: 3;
  width: 96%;
  top: calc(100% - 24px);
}

.inputItem .input {
  border: none;
  padding-left: 30px;
  font-size: 18px;
  margin-left: 50px;
  height: 60px;
  width: calc(100% - 50px);
  box-shadow: 0 0 3px 1px rgba(100, 100, 100, 0.5) inset;
}

.inputItem .itemContent {
  padding: 16px 16px 16px 60px;
  font-size: 0;
}

.itemContent .content {
  display: inline-block;
  position: relative;
  transition: color 0.5s;
  font-size: 18px;
  line-height: 1;
  word-break: break-all;
  min-width: 100%;
}

.itemContent .content:hover .close::after {
  position: absolute;
  content: "×";
  right: 10px;
  color: #cc9a9a;
  font-size: 30px;
  transition: color 0.2s ease-out;
}

.itemContent .content:hover .close:hover::after {
  color: #af5b5e;
}

.itemContent .check {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #eee;
  top: 50%;
  left: 6px;
  transform: translateY(-50%);
  z-index: 10;
}

.itemContent .check input {
  display: inline-block;
  border: none;
  margin: 0;
  opacity: 0;
  outline: none;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.itemContent .check.checked {
  border-color: #ddd;
  text-align: center;
}

.itemContent .check.checked+.content {
  text-decoration: line-through;
  color: #ddd;
}

.itemContent .check.checked::after {
  font-family: monospace;
  content: "√";
  color: turquoise;
  font-size: 18px;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.hide {
  display: none;
}
</style>