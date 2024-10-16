# Example

## ToDoList example

```tsx twoslash
import { createStore, ref, computed } from 'reactivity-store';

const useTodo = createStore(() => {
  const data = ref<{ id: number, text: string, done: boolean, edit: boolean }[]>([]);

  const mode = ref<'all' | 'done' | 'active'>('all')

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
```

## Example

<script setup>
  import Todo from '@theme/components/todoList.vue'
</script>

<Todo />
