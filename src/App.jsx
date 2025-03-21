import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './services/taskService';
import { login, register } from './services/authService';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Login from './components/Login';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setUser(JSON.parse(localStorage.getItem('user')));
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch tasks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (task) => {
    try {
      const newTask = await createTask(task);
      setTasks([...tasks, newTask]);
    } catch (error) {
      setError('Failed to add task');
      console.error(error);
    }
  };

  const handleUpdateTask = async (id, updatedTask) => {
    try {
      const updated = await updateTask(id, updatedTask);
      setTasks(tasks.map(task => task.id === id ? updated : task));
    } catch (error) {
      setError('Failed to update task');
      console.error(error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      setError('Failed to delete task');
      console.error(error);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const { user, token } = await login(credentials);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsLoggedIn(true);
      setUser(user);
      fetchTasks();
    } catch (error) {
      setError('Login failed');
      console.error(error);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const { user, token } = await register(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsLoggedIn(true);
      setUser(user);
    } catch (error) {
      setError('Registration failed');
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setTasks([]);
  };

  if (loading) {
    return <div className="app-container">Loading...</div>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ToDo App</h1>
        {isLoggedIn && (
          <div className="user-info">
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </header>

      {error && <div className="error-message">{error}</div>}

      {!isLoggedIn ? (
        <div className="auth-container">
          {isRegistering ? (
            <>
              <Login 
                onSubmit={handleRegister} 
                buttonText="Register" 
                includeNameField={true} 
              />
              <p>
                Already have an account?{' '}
                <button 
                  onClick={() => setIsRegistering(false)}
                  className="text-button"
                >
                  Login
                </button>
              </p>
            </>
          ) : (
            <>
              <Login onSubmit={handleLogin} buttonText="Login" />
              <p>
                Don't have an account?{' '}
                <button 
                  onClick={() => setIsRegistering(true)}
                  className="text-button"
                >
                  Register
                </button>
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="tasks-container">
          <TaskForm onAddTask={handleAddTask} />
          <TaskList 
            tasks={tasks} 
            onUpdateTask={handleUpdateTask} 
            onDeleteTask={handleDeleteTask} 
          />
        </div>
      )}
    </div>
  );
}

export default App;