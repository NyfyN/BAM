import { Text, TextInput, Button } from 'react-native';
import screenStyles from "./screenStyles";

const TaskScreen = ({ tasks, newTask, setNewTask, onAddTask, onLogout, onDeleteAll }) => (
  <>
    <Text style={screenStyles.header}>Lista zadań</Text>
    <TextInput
      style={screenStyles.input}
      placeholder="Nowe zadanie"
      value={newTask}
      onChangeText={setNewTask}
    />
    <Button title="Dodaj zadanie" onPress={onAddTask} />
    <Button title="Wyloguj się" onPress={onLogout} />
    <Button title="Usuń wszystkie zadania" onPress={onDeleteAll} />
    {tasks.length === 0 ? (
      <Text>Brak zadań do wyświetlenia.</Text>
    ) : (
      tasks.map((task) => <Text key={task.id}>{task.task}</Text>)
    )}
  </>
);

export default TaskScreen;