// DOM Elements
const todoForm = document.getElementById('todo-form');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const todoList = document.getElementById('todo-list');
const todoItemTemplate = document.getElementById('todo-item-template');
const filterAllBtn = document.getElementById('filter-all');
const filterActiveBtn = document.getElementById('filter-active');
const filterCompletedBtn = document.getElementById('filter-completed');

// Current filter state
let currentFilter = 'all';

// Store all todos
let allTodos = [];

// Load todos when the page loads
document.addEventListener('DOMContentLoaded', loadTodos);

// Event listeners
todoForm.addEventListener('submit', addTodo);
filterAllBtn.addEventListener('click', () => setFilter('all'));
filterActiveBtn.addEventListener('click', () => setFilter('active'));
filterCompletedBtn.addEventListener('click', () => setFilter('completed'));

// Load todos from the database
async function loadTodos() {
  try {
    allTodos = await window.todoAPI.getTodos();
    renderTodos();
  } catch (error) {
    console.error('Error loading todos:', error);
    todoList.innerHTML = `<div class="text-center text-red-500 py-4">Görevler yüklenirken bir hata oluştu.</div>`;
  }
}

// Add a new todo
async function addTodo(e) {
  e.preventDefault();
  
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  
  if (!title) return;
  
  try {
    const newTodo = await window.todoAPI.addTodo({
      title,
      description,
      completed: false
    });
    
    allTodos.unshift(newTodo); // Add to the beginning of the array
    renderTodos();
    
    // Reset form
    todoForm.reset();
  } catch (error) {
    console.error('Error adding todo:', error);
    alert('Görev eklenirken bir hata oluştu.');
  }
}

// Toggle todo completion status
async function toggleTodoStatus(id, completed) {
  try {
    const updatedTodo = await window.todoAPI.updateTodo({ id, completed });
    
    // Update in local array
    const index = allTodos.findIndex(todo => todo.id === updatedTodo.id);
    if (index !== -1) {
      allTodos[index] = updatedTodo;
      renderTodos();
    }
  } catch (error) {
    console.error('Error updating todo:', error);
    alert('Görev güncellenirken bir hata oluştu.');
  }
}

// Delete a todo
async function deleteTodo(id) {
  if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;
  
  try {
    const success = await window.todoAPI.deleteTodo(id);
    
    if (success) {
      // Remove from local array
      allTodos = allTodos.filter(todo => todo.id !== id);
      renderTodos();
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    alert('Görev silinirken bir hata oluştu.');
  }
}

// Set the current filter
function setFilter(filter) {
  currentFilter = filter;
  
  // Update filter button styles
  [filterAllBtn, filterActiveBtn, filterCompletedBtn].forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white');
    btn.classList.add('bg-gray-200', 'text-gray-800');
  });
  
  let activeBtn;
  switch (filter) {
    case 'active':
      activeBtn = filterActiveBtn;
      break;
    case 'completed':
      activeBtn = filterCompletedBtn;
      break;
    default:
      activeBtn = filterAllBtn;
  }
  
  activeBtn.classList.remove('bg-gray-200', 'text-gray-800');
  activeBtn.classList.add('bg-blue-600', 'text-white');
  
  renderTodos();
}

// Render todos based on current filter
function renderTodos() {
  // Clear the list
  todoList.innerHTML = '';
  
  // Filter todos based on current filter
  let filteredTodos = allTodos;
  if (currentFilter === 'active') {
    filteredTodos = allTodos.filter(todo => !todo.completed);
  } else if (currentFilter === 'completed') {
    filteredTodos = allTodos.filter(todo => todo.completed);
  }
  
  // Show message if no todos
  if (filteredTodos.length === 0) {
    todoList.innerHTML = `<div class="text-center text-gray-500 py-4">Görev bulunamadı.</div>`;
    return;
  }
  
  // Render each todo
  filteredTodos.forEach(todo => {
    const todoElement = createTodoElement(todo);
    todoList.appendChild(todoElement);
  });
}

// Create a todo element from template
function createTodoElement(todo) {
  const todoElement = todoItemTemplate.content.cloneNode(true).firstElementChild;
  
  // Set data attributes
  todoElement.dataset.id = todo.id;
  
  // Set content
  const checkbox = todoElement.querySelector('.todo-checkbox');
  const title = todoElement.querySelector('.todo-title');
  const description = todoElement.querySelector('.todo-description');
  const date = todoElement.querySelector('.todo-date');
  const deleteBtn = todoElement.querySelector('.todo-delete');
  
  checkbox.checked = todo.completed;
  title.textContent = todo.title;
  description.textContent = todo.description || '';
  
  // Format date
  const createdAt = new Date(todo.createdAt);
  date.textContent = `Oluşturulma: ${createdAt.toLocaleDateString('tr-TR')}`;
  
  // Apply completed styling
  if (todo.completed) {
    title.classList.add('line-through', 'text-gray-500');
  }
  
  // Add event listeners
  checkbox.addEventListener('change', () => toggleTodoStatus(todo.id, checkbox.checked));
  deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
  
  return todoElement;
}