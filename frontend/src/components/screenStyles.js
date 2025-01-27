import { StyleSheet } from "react-native";

const screenStyles = StyleSheet.create({
    container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'white',
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
  list: {
    marginBottom: 20,
  },
  offline: {
    textAlign: "center",
    justifyContent: "center",
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    marginRight: 10,
    fontSize: 16,
  },
});

export default screenStyles;