import { Text, TextInput, Button } from 'react-native';
import screenStyles from "./screenStyles";

const LoginScreen = ({ username, password, setUsername, setPassword, onLogin, onRegister }) => (
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
    <Button title="Register" onPress={onRegister} />
  </>
);

export default LoginScreen;