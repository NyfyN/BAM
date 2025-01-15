import {Text, TextInput, Button} from 'react-native';
import screenStyles from "./screenStyles";

const RegisterScreen = ({ username, password, setUsername, setPassword, onRegister, onCancel}) => (
    <>
        <Text style={screenStyles.header}>Rejestracja</Text>
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
        <Button title="Register" onPress={onRegister}/>
        <Button title="Cancel" onPress={onCancel}/>
    </>
)

export default RegisterScreen;