<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createState } from 'reactivity-store';
import { createElement, useState } from 'react';
import ReactDOM from 'react-dom/client';

const useTodo = createState(() => ({
  data: [
    { id: 1, text: 'todo 1', done: false, edit: false },
    { id: 2, text: 'todo 2', done: false, edit: false },
    { id: 3, text: 'todo 3', done: false, edit: false },
  ],
}), {
  withDeepSelector: false,
  withNamespace: 'useTodo',
  withPersist: 'todo-list',
  withActions: (s: { data: { id: number; text: string; done: boolean; edit: boolean; }[]; }) => ({
    addTodo: (text: string) => {
      s.data.push({ id: s.data.length + Math.random(), text, done: false, edit: false });
    },
    removeTodo: (id: number) => {
      s.data = s.data.filter((todo) => todo.id !== id);
    },
    toggleTodo: (id: number) => {
      s.data = s.data.map((todo) => {
        if (todo.id === id) {
          todo.done = !todo.done;
        }
        return todo;
      });
    },
    toggleEdit: (id: number) => {
      s.data = s.data.map((todo) => {
        if (todo.id === id) {
          todo.edit = !todo.edit;
        } else {
          todo.edit = false;
        }
        return todo;
      });
    },
    editTodo: (id: number, content: string) => {
      s.data = s.data.map((todo) => {
        if (todo.id === id) {
          todo.text = content;
        }
        return todo;
      });
    }
  })
});


const divRef = ref<HTMLDivElement>();

const Item = ({ id }: { id: number }) => {
  const { data, toggleTodo, toggleEdit, removeTodo, editTodo } = useTodo.useShallowSelector();

  const todo = data.find((todo) => todo.id === id);

  if (!todo) {
    return null;
  }

  return createElement('li', null,
    createElement('div', { style: { display: 'inline-flex', width: '60%' } }, createElement('input', { type: 'checkbox', checked: todo.done, onChange: () => toggleTodo?.(todo.id) }),
      todo.edit ? (
        createElement('input', { type: 'text', autoFocus: true, value: todo.text, onChange: (e: { target: { value: string; }; }) => editTodo?.(todo.id, e.target.value) })
      ) : (
        createElement('span', null, todo.text)
      ))
    ,
    createElement('div', null,
      createElement('button', { onClick: () => toggleEdit?.(todo.id) }, todo.edit ? 'Done' : 'Edit'),
      createElement('button', { style: { marginLeft: '10px' }, onClick: () => removeTodo?.(todo.id) }, 'Remove'),
    )
  )
}

const App = () => {
  const { data, addTodo } = useTodo.useShallowSelector();

  const [v, setV] = useState('')

  return createElement('div', { style: { border: '1px solid', borderRadius: '2px', padding: '8px' } },
    createElement('h1', { style: { padding: '2px', textAlign: 'center' } }, 'Todo List'),
    createElement('div', { style: { padding: '2px', textAlign: 'center', margin: '8px' } },
      createElement('span', null, 'Total: '),
      createElement('span', { style: { color: 'red' } }, data.length),
      createElement('span', null, ' Done: '),
      createElement('span', { style: { color: 'red' } }, data.filter((todo: { done: boolean; }) => todo.done).length),
      createElement('span', null, ' Undone: '),
      createElement('span', { style: { color: 'red' } }, data.filter((todo: { done: boolean; }) => !todo.done).length),
    ),
    createElement('div', { style: { display: 'flex', justifyContent: 'space-around' } },
      createElement('input', { placeholder: 'input', value: v, onChange: (e) => setV(e.target.value), style: { border: '1px solid', padding: '2px', borderRadius: '2px', width: '50%' } }),
      createElement('button', { onClick: () => { addTodo(v), setV('') }, style: { border: '1px solid', borderRadius: '4px', padding: '5px 10px' } }, 'Add')
    ),
    createElement('ul', null, data.map((todo: { id: number; text: string; done: boolean; edit: boolean; }) => (
      createElement(Item, { id: todo.id, key: todo.id })
    ))),
    // createElement('button', { onClick: () => addTodo?.('New Todo') }, 'Add Todo'),
  );
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
.todo-list {
  border: 1px solid;
  border-radius: 2px;
  padding: 8px;
}

button {
  border: 1px solid;
  border-radius: 4px;
  padding: 5px 10px;
}

input:not([type=checkbox]) {
  border: 1px solid;
  padding: 2px;
  border-radius: 2px;
  width: 50%;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>