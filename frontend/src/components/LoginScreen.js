import { Text, TextInput, Button } from 'react-native';
import screenStyles from "./screenStyles";

const LoginScreen = ({ username, password, setUsername, setPassword, onLogin }) => (
  <>
    <Text style={screenStyles.header}>Logowanie</Text>
    <TextInput
      style={screenStyles.input}
      placeholder="Username"
      value={username}
      onChangeText={setUsername}
    />
    <TextInput
      style={screenStyles.input}
      placeholder="Password"
      value={password}
      onChangeText={setPassword}
      secureTextEntry
    />
    <Button title="Login" onPress={onLogin} />
  </>
);

export default LoginScreen;