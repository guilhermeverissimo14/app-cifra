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
  const [selectedKey, setSelectedKey] = useState<string>(""); // Inicia sem tom
  const [inputText, setInputText] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Atualiza as notas ao mudar o tom
  const handleChangeKey = (newKey: string) => {
    if (selectedKey) {
      setInputText(transposeNotes(inputText, selectedKey, newKey));
    }
    setSelectedKey(newKey);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Seletor de tom */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.keySelector}>
        <Text style={styles.keySelectorText}>
          {selectedKey ? `Tom Atual: ${selectedKey}` : "Selecione um Tom"}
        </Text>
      </TouchableOpacity>

      {/* Área de entrada e exibição das notas */}
      <ScrollView style={styles.scrollView}>
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

        {/* Exibição das notas convertidas */}
        {selectedKey && (
          <>
            <Text style={styles.convertedNotesLabel}>Notas Convertidas:</Text>
            <Text style={styles.convertedNotes}>{inputText.replace(/<|>/g, "")}</Text>
          </>
        )}
      </ScrollView>

      {/* Modal para seleção do tom */}
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
    backgroundColor: "#007BFF",
    borderRadius: 10,
    marginBottom: 10,
  },
  keySelectorText: {
    color: "#FFF",
    fontSize: 18,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 18,
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
