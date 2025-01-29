import { Input } from '@/src/components/input/inputPrimary';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>

      <Text style={styles.text}>
        Criar nova musica
      </Text>

        <Text style={styles.textLabel}>Título da música:</Text>
        <Input name="title" keyboardType='default' />

        <Text  style={styles.textLabel}>Tom da musica:</Text>
        <Input name="tone" keyboardType='default' />

        <Text  style={styles.textLabel}>Nota da musica:</Text>
        <TextInput
          style={styles.input}
          keyboardType='default'
          multiline={true}
          numberOfLines={5}
          textAlignVertical="top"
          placeholder="Digite suas notas aqui..."
          placeholderTextColor="#888"
        />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 10,
  },
  text: {
    fontSize: 20,
    color: '#333',
    marginBottom: 16,
  },
  textLabel: {
    width: '80%',
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
    width: '80%',
    marginBottom: 16,
  },
}); 