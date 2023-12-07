## ToDoList example

```tsx
import { createState } from 'reactivity-store';

const useTodo = createState(() => ({
  data: [],
}), {
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
```

## Example

<script setup>
  import Todo from '@theme/components/todoList.vue'
</script>

<Todo />
