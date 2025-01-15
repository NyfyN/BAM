import axios from 'axios';
import {useEffect, useState} from 'react';
import { Alert, View } from 'react-native';
import LoginScreen from './components/LoginScreen';
import TaskScreen from './components/TaskScreen';
import RegisterScreen from './components/RegisterScreen';
import AsyncStorage from "@react-native-async-storage/async-storage";
import screenStyles from "./components/screenStyles";

const API_URL = 'http://192.168.0.128:5000';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [taskUpdated, setTaskUpdated] = useState(false);

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [taskUpdated]);

  const refreshTasks = () => {
    setTaskUpdated((prev) => !prev);
  }

  // Pobierz zadania z backendu
  const fetchTasks = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Fetch tasks error:', error.response.data);
      Alert.alert('Błąd', 'Nie udało się pobrać zadań.');
    }
  };

  // Dodaj nowe zadanie
  const addTask = async () => {
    if (!newTask.trim()) return Alert.alert('Błąd', 'Treść zadania nie może być pusta.');
    try {
      await axios.post(
          `${API_URL}/tasks`,
          {task: newTask},
          {headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'}}
      );
      setNewTask('');
      refreshTasks();
    } catch (error) {
      console.error('Add task error:', error);
      Alert.alert('Błąd', 'Nie udało się dodać zadania.');
    }
  };

  // Rejestracja użytkownika
  const register = async () => {
    try {
      await axios.post(`${API_URL}/register`, {username, password},
          {
            headers: {'Content-Type': 'application/json'},
          });
      setScreen('login');
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Błąd', 'Nie udało się zarejestrować');
    }
  }

  // Logowanie użytkownika
  const login = async () => {
    try {
      const response = await axios.post(`${API_URL}/login`, {username, password}, {
        headers: {'Content-Type': 'application/json'},
      });
      const new_token = response.data.access_token;
      console.log(username);
      await AsyncStorage.setItem('token', new_token);
      setToken(new_token);
      setScreen('tasks');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Błąd', 'Nie udało się zalogować.');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken(null);
      setScreen('login');
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

  // return (
  //   <View style={screenStyles.container}>
  //     {!token ? (
  //         <LoginScreen
  //           username={username}
  //           password={password}
  //           setUsername={setUsername}
  //           setPassword={setPassword}
  //           onLogin={login}
  //           onRegister={register}
  //         />
  //     ) : (
  //         <TaskScreen
  //           tasks={tasks}
  //           newTask={newTask}
  //           setNewTask={setNewTask}
  //           onAddTask={addTask}
  //           onLogout={logout}
  //           onDeleteAll={deleteTasks}
  //         />
  //     )}
  //   </View>
  // );
}
