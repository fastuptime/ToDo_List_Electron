const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

ipcMain.handle('get-todos', async () => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return todos;
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
});

ipcMain.handle('add-todo', async (_, todoData) => {
  try {
    const newTodo = await prisma.todo.create({
      data: todoData
    });
    return newTodo;
  } catch (error) {
    console.error('Error adding todo:', error);
    return null;
  }
});

ipcMain.handle('update-todo', async (_, { id, ...data }) => {
  try {
    const updatedTodo = await prisma.todo.update({
      where: { id: parseInt(id) },
      data
    });
    return updatedTodo;
  } catch (error) {
    console.error('Error updating todo:', error);
    return null;
  }
});

ipcMain.handle('delete-todo', async (_, id) => {
  try {
    await prisma.todo.delete({
      where: { id: parseInt(id) }
    });
    return true;
  } catch (error) {
    console.error('Error deleting todo:', error);
    return false;
  }
});

app.on('before-quit', async () => {
  await prisma.$disconnect();
});