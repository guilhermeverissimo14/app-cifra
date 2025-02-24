import { useMusicDatabase } from "@/src/database/musicDatabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import ToastManager, { Toast } from 'toastify-react-native';

const NOTES_MAP: { [key: string]: string[] } = {
  C: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  "C#": ["C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C"],
  D: ["D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#"],
  "D#": ["D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D"],
  E: ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"],
  F: ["F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"],
  "F#": ["F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F"],
  G: ["G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#"],
  "G#": ["G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G"],
  A: ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"],
  "A#": ["A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A"],
  B: ["B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#"],
};

// Função para transpor notas
const transposeNotes = (inputText: string, fromKey: string, toKey: string): string => {
  if (!fromKey || !toKey || fromKey === toKey) return inputText; // Evita erro se o tom ainda não foi selecionado

  const fromScale = NOTES_MAP[fromKey];
  const toScale = NOTES_MAP[toKey];

  return inputText.replace(/<([A-G]#?[^>]*)>/g, (match: string, note: string) => {
    const matchResult = note.match(/[A-G]#?/);
    const rootNote = matchResult ? matchResult[0] : ""; // Apenas a nota principal
    const suffix = note.replace(rootNote, ""); // Mantém sufixos como "m", "7", etc.

    const index = fromScale.indexOf(rootNote);
    return index !== -1 ? `<${toScale[index]}${suffix}>` : match;
  });
};

export default function NewMusic() {
  const [inputName, setInputName] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<string>(""); // Inicia sem tom
  const [inputText, setInputText] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const musicDatabase = useMusicDatabase();
  const router = useRouter();

  // Atualiza as notas ao mudar o tom
  const handleChangeKey = (newKey: string) => {
    if (selectedKey) {
      setInputText(transposeNotes(inputText, selectedKey, newKey));
    }
    setSelectedKey(newKey);
    setModalVisible(false);
  };

  const handleSaveMusic = async () => {
    try {
      await musicDatabase.saveMusic(inputName, selectedKey, inputText);
      Toast.success("Música salva com sucesso");
      setTimeout(() => {
        router.navigate("/(tabs)");
      }, 3000);
      setInputName("");
      setSelectedKey("");
      setInputText("");
    } catch (error) {
      console.error("Error saving music", error);
      Toast.error("Erro ao salvar música");
    }
  }

  return (
    <View style={styles.container}>
      <ToastManager
        width={300}
      />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.inputLabel}>Nome da música:</Text>
        <TextInput
          style={styles.inputName}
          placeholder="Nome da música"
          value={inputName}
          onChangeText={(text) => setInputName(text)}
        />

        {!inputName && <Text style={{ color: "red" }}>Nome é obrigatório.</Text>}

        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.keySelector}>
          <Text style={styles.keySelectorText}>
            {selectedKey ? `Tom Atual: ${selectedKey}` : "Selecione um Tom"}
          </Text>
        </TouchableOpacity>
        {!selectedKey && <Text style={{ color: "red", marginBottom: 10 }}>Tom é obrigatório.</Text>}


        <Text style={styles.inputLabel}>Digite as notas:</Text>
        <TextInput
          multiline
          numberOfLines={10}
          textAlignVertical="top"
          style={styles.input}
          value={inputText}
          onChangeText={(text) => setInputText(text)}
          placeholder="Ex: <D><D#>m <C> a <C#>"
        />

        {!inputText && <Text style={{ color: "red", marginTop: 5 }}>Notas são obrigatórias.</Text>}

        {selectedKey && (
          <>
            <Text style={styles.convertedNotesLabel}>Notas Convertidas:</Text>
            <Text style={styles.convertedNotes}>{inputText.replace(/<|>/g, "")}</Text>
          </>
        )}

        <TouchableOpacity disabled={!inputName || !selectedKey || !inputText } onPress={handleSaveMusic} style={styles.keySelector}>
          <Text style={styles.keySelectorText}>Salvar Música</Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha um tom</Text>

            {Object.keys(NOTES_MAP).map((key) => (
              <TouchableOpacity key={key} onPress={() => handleChangeKey(key)} style={styles.modalOption}>
                <Text style={styles.modalOptionText}>{key}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight! + 10 : 10,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  keySelector: {
    padding: 15,
    backgroundColor: "#a9a9a9",
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 10,
  },
  keySelectorText: {
    color: "#111",
    fontSize: 18,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 16,
    margin: 5
  },
  inputName: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: "top",
    minHeight: 150,
  },
  scrollView: {
    marginTop: 20,
  },
  convertedNotesLabel: {
    fontSize: 22,
    fontWeight: "bold",
  },
  convertedNotes: {
    fontSize: 24,
    color: "blue",
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalOption: {
    padding: 10,
    backgroundColor: "#DDD",
    borderRadius: 5,
    marginVertical: 5,
  },
  modalOptionText: {
    fontSize: 18,
    textAlign: "center",
  },
  modalCloseButton: {
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: "#FFF",
    fontSize: 18,
    textAlign: "center",
  },
});
