import axios from 'axios';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import LoginScreen from './components/LoginScreen';
import TaskScreen from './components/TaskScreen';
import RegisterScreen from './components/RegisterScreen';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import screenStyles from "./components/screenStyles";

const API_URL = 'http://SET_BACKEND_ADDRESS_HERE:5000';

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


  const toggleOffline = () => {
    setOffline((prev) => {
      return !prev;
    })
  };

  // Rejestracja użytkownika
  const register = async () => {
    try {
      await axios.post(`${API_URL}/register`, { username, password },
        {
          headers: { 'Content-Type': 'application/json' },
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
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Błąd', 'Nie udało się zalogować.');
    }
  };

  const logout = async () => {
    try {
      // Sprawdzenie, czy token istnieje przed jego usunięciem
      const tokenExists = await SecureStore.getItemAsync('token');
      if (tokenExists) {
        await SecureStore.deleteItemAsync('token');
        setToken(null);
      }

      setScreen('login');

      // Jeśli offline, zapisz dane zadań (upewnij się, że przekazujesz wartość)
      if (offline) {
        await SecureStore.setItem('tasks', JSON.stringify([])); // Zapisz pustą tablicę lub odpowiednią wartość
      }

      Alert.alert("Wylogowano pomyślnie");
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Błąd', 'Nie udało się wylogować');
    }
  };


  const deleteTasks = async () => {
    try {
      if (!offline) {
        await axios.delete(`${API_URL}/deletetasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert("Usunięto zadania!");
      }

      if (offline) {
        Alert.alert("Usunięto wszystkie zadania z kolejki!");
        await SecureStore.deleteItemAsync('queuedTasks');
      }

    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się usunąc wszystkich zadań.');
    }
    refreshTasks();
  }
  const synchronizeTasks = async () => {
    try {
      const queuedTasksString = await SecureStore.getItemAsync('queuedTasks');
      const queuedTasks = JSON.parse(queuedTasksString);

      if (Array.isArray(queuedTasks)) {
        await Promise.all(
          queuedTasks.map(async (task) => {
            await axios.post(
              `${API_URL}/tasks`,
              { task: task.task },
              { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
          })
        );
        // Po zakończeniu synchronizacji usuń zadania z SecureStore
        await SecureStore.deleteItemAsync('queuedTasks');
      } else {
        Alert.alert('Brak zadania w kolejce!');
      }

    } catch (error) {
      console.error('Sync tasks error: ', error);
      Alert.alert('Błąd', 'Nie udało się zsynchornizować wszystkich zadań');
    }
    refreshTasks();
  };

  const checkTasks = async () => {
    const queuedTasksString = await SecureStore.getItemAsync('queuedTasks');
    const queuedTasks = JSON.parse(queuedTasksString);

    if (Array.isArray(queuedTasks)) {
      let taskList = queuedTasks.map(task => task.task).join("\n");
      const message = `Liczba zadań w kolejce: ${queuedTasks.length}\n\nZadania: \n${taskList}`;
      Alert.alert('Zadania w kolejce', message);
    } else {
      Alert.alert('Brak zadań w kolejce!');
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
          synchronizeAllTasks={synchronizeTasks}
          checkTasks={checkTasks}
        />
      )}
    </View>
  )
}
