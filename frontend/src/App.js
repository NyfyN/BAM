import axios from 'axios';
import { useState } from 'react';
import { Alert, View, Text, TextInput, Button, StyleSheet } from 'react-native';

const API_URL = 'http://192.168.0.196:5000';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);

  // Pobierz zadania z backendu
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Fetch tasks error:', error);
      Alert.alert('Błąd', 'Nie udało się pobrać zadań.');
    }
  };

  // Dodaj nowe zadanie
  const addTask = async () => {
    if (!newTask.trim()) return Alert.alert('Błąd', 'Treść zadania nie może być pusta.');
    try {
      await axios.post(
        `${API_URL}/tasks`,
        { task: newTask },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setNewTask('');
      fetchTasks();
    } catch (error) {
      console.error('Add task error:', error);
      Alert.alert('Błąd', 'Nie udało się dodać zadania.');
    }
  };

  // Logowanie użytkownika
  const login = async () => {
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password }, {
        headers: { 'Content-Type': 'application/json' },
      });
      setToken(response.data.access_token);
      fetchTasks();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Błąd', 'Nie udało się zalogować.');
    }
  };

  return (
    <View style={styles.container}>
      {!token ? (
        <>
          <Text style={styles.header}>Logowanie</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Login" onPress={login} />
        </>
      ) : (
        <>
          <Text style={styles.header}>Lista zadań</Text>
          <TextInput
            style={styles.input}
            placeholder="Nowe zadanie"
            value={newTask}
            onChangeText={setNewTask}
          />
          <Button title="Dodaj zadanie" onPress={addTask} />
          {tasks.map((task) => (
            <Text key={task.id}>{task.task}</Text>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});