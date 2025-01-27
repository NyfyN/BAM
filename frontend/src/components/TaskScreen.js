import { Text, TextInput, Button, FlatList, View } from 'react-native';
import screenStyles from "./screenStyles";

const TaskScreen = ({ tasks, newTask, setNewTask, onAddTask, onLogout, onDeleteAll, synchronizeAllTasks, checkTasks, offline }) => (
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
    {!offline && (
      <Button title="Synchronizuj zadania" onPress={synchronizeAllTasks} />
    )}

    <Button title="Check tasks in queue" onPress={checkTasks} />
    {tasks.length === 0 ? (
      <Text>Brak zadań do wyświetlenia.</Text>
    ) : (
      <View style={screenStyles.list}>
        <Text>Lista zadań:</Text>
        <FlatList
          data={tasks}
          renderItem={({ item }) => <Text key={item.id}>&middot; {item.task}</Text>}
        />
      </View>
    )}
  </>
);

export default TaskScreen;
