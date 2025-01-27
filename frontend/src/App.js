import axios from 'axios';
import {useEffect, useState} from 'react';
import { Alert, View} from 'react-native';
import LoginScreen from './components/LoginScreen';
import TaskScreen from './components/TaskScreen';
import RegisterScreen from './components/RegisterScreen';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import screenStyles from "./components/screenStyles";

const API_URL = 'http://172.20.10.7:5000';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [taskUpdated, setTaskUpdated] = useState(false);
  const [offline, setOffline] = useState(true);

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [taskUpdated]);

  const refreshTasks = () => {
    setTaskUpdated((prev) => !prev);
  }

  const fetchTasks = async () => {
  if (!token) return;
  try {
    if (!offline) {
      // Fetch tasks from the server
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data.tasks);
      // Save tasks to SecureStore for offline access
      await SecureStore.setItemAsync('tasks', JSON.stringify(response.data.tasks));
    } else {
      // Load tasks from SecureStore
      const offlineTasks = await SecureStore.getItemAsync('tasks');
      setTasks(offlineTasks ? JSON.parse(offlineTasks) : []);
    }
  } catch (error) {
    console.error('Fetch tasks error:', error.response?.data || error);
    Alert.alert('Błąd', 'Nie udało się pobrać zadań.');
  }
};

  const addTask = async () => {
    if (!newTask.trim()) return Alert.alert('Błąd', 'Treść zadania nie może być pusta.');
    try {
      if (!offline) {
        // Add task to the server
        await axios.post(
          `${API_URL}/tasks`,
          { task: newTask },
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
      } else {
        // Queue task locally
        const queuedTasks = await SecureStore.getItemAsync('queuedTasks');
        const updatedQueue = queuedTasks ? JSON.parse(queuedTasks) : [];
        updatedQueue.push({ task: newTask });
        await SecureStore.setItemAsync('queuedTasks', JSON.stringify(updatedQueue));
      }
      setNewTask('');
      refreshTasks();
      Alert.alert('Dodano zadanie');
    } catch (error) {
      console.error('Add task error:', error);
      Alert.alert('Błąd', 'Nie udało się dodać zadania.');
    }
  };

  const synchronizeTasks = async () => {
    if (!token) return Alert.alert('Błąd', 'Zalogowano bez wykorzystania tokena.');
    try {
      const queuedTasks = await SecureStore.getItemAsync('queuedTasks');
      if (queuedTasks) {
        const tasksToSync = JSON.parse(queuedTasks);
        for (const task of tasksToSync) {
          await axios.post(
            `${API_URL}/tasks`,
            { task: task.task },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
        }
        Alert.alert('Zsynchronizowano zadania z serwerem');
        // Clear local queue after syncing
        await SecureStore.deleteItemAsync('queuedTasks');
      }
      refreshTasks();
    } catch (error) {
      console.error('Sync tasks error:', error);
      Alert.alert('Błąd', 'Nie udało się zsynchronizować zadań.');
    }
  };

  const toggleOffline = () => {
    setOffline((prev) => {
      if (prev) {
        synchronizeTasks();
      }
      return !prev;
    })
  };

  // Rejestracja użytkownika
  const register = async () => {
    try {
      await axios.post(`${API_URL}/register`, {username, password},
          {
            headers: {'Content-Type': 'application/json'},
          });
      setScreen('login');
      Alert.alert("Konto zostało zarejestrowane pomyślnie");
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Błąd', 'Nie udało się zarejestrować');
    }
  }

  // Logowanie użytkownika
  const login = async () => {
  try {
    if (await LocalAuthentication.hasHardwareAsync()) {
      const unlock = await LocalAuthentication.authenticateAsync();
      if (unlock.success === true) {
        const response = await axios.post(`${API_URL}/login`, { username, password }, {
        headers: { 'Content-Type': 'application/json' },
        });
        const new_token = response.data.access_token;
        await SecureStore.setItemAsync('token', new_token);
        setToken(new_token);
        setScreen('tasks');
        Alert.alert('Pomyślnie zalogowano się');
        await synchronizeTasks(); // Sync tasks after logging in
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    Alert.alert('Błąd', 'Nie udało się zalogować.');
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      setToken(null);
      setScreen('login');
      if(offline) {
        await SecureStore.setItem('tasks');
      }
      Alert.alert("Wylogowano pomyślnie")
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Błąd', 'Nie udało się wylogować');
    }
  }

  const deleteTasks = async () => {
    try {
      await axios.delete(`${API_URL}/deletetasks`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      refreshTasks();
      Alert.alert("Usunięto wszystkie zadania");
    } catch (error) {
      console.error('Delete tasks error: ', error);
      Alert.alert('Błąd', 'Nie udało się usunąć wszystkich zadań');
    }
  }

  return (
      <View style={screenStyles.container}>
        {screen === 'login' && (
            <LoginScreen
              username={username}
              password={password}
              setUsername={setUsername}
              setPassword={setPassword}
              onLogin={login}
              onRegister={() => setScreen('register')}
              offline={offline}
              setOffline={toggleOffline}
            />
        )}
        {screen === 'register' && (
            <RegisterScreen
              username={username}
              password={password}
              setUsername={setUsername}
              setPassword={setPassword}
              onRegister={register}
              onCancel={() => setScreen('login')}
            />
        )}
        {screen === 'tasks' && token && (
            <TaskScreen
              tasks={tasks}
              newTask={newTask}
              setNewTask={setNewTask}
              onAddTask={addTask}
              onLogout={logout}
              onDeleteAll={deleteTasks}
            />
        )}
      </View>
  )
}
