import { Text, TextInput, Button, Switch, View } from 'react-native';
import screenStyles from "./screenStyles";

const LoginScreen = ({ username, password, setUsername, setPassword, onLogin, onRegister, offline, setOffline }) => (
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
    <View style={screenStyles.toggleContainer}>
        <Text style={screenStyles.label}>Tryb offline:</Text>
        <Switch
          value={offline}
          onValueChange={setOffline}
        />
    </View>
    <Button title="Login" onPress={onLogin} />
    <Button title="Register" onPress={onRegister} />
  </>
);

export default LoginScreen;