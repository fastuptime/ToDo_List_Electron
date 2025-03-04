const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('todoAPI', {
  getTodos: () => ipcRenderer.invoke('get-todos'),
  addTodo: (todoData) => ipcRenderer.invoke('add-todo', todoData),
  updateTodo: (todoData) => ipcRenderer.invoke('update-todo', todoData),
  deleteTodo: (id) => ipcRenderer.invoke('delete-todo', id)
});