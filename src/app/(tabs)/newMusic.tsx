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
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
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

export default function NewMusic() {
  const [inputName, setInputName] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showNotesInput, setShowNotesInput] = useState<boolean>(false);

  const musicDatabase = useMusicDatabase();
  const router = useRouter();

  // Alteração: Agora só muda o tom, SEM alterar as notas
  const handleChangeKey = (newKey: string) => {
    setSelectedKey(newKey);
    setModalVisible(false);
  };

  const handleSaveMusic = async () => {
    setLoading(true);
    try {
      await musicDatabase.saveMusic(inputName, selectedKey, inputText);
      Toast.success("Música salva com sucesso");
      setLoading(false);
      setTimeout(() => {
        router.navigate("/(tabs)");
      }, 2000);
      setInputName("");
      setSelectedKey("");
      setInputText("");
      setShowNotesInput(false);
    } catch (error) {
      console.error("Error saving music", error);
      Toast.error("Erro ao salvar música");
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ToastManager width={300} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nova Música</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Nome da música */}
        <Text style={styles.inputLabel}>Nome da música</Text>
        <TextInput
          style={styles.inputName}
          placeholder="Nome da música"
          placeholderTextColor="#8e99cc"
          value={inputName}
          onChangeText={setInputName}
        />
        {!inputName && <Text style={styles.errorText}>Nome é obrigatório</Text>}

        {/* Seletor de tom */}
        <Text style={styles.inputLabel}>Tom da música</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.keySelector}>
          <Text style={styles.keySelectorText}>
            {selectedKey ? `Tom: ${selectedKey}` : "Selecione um tom"}
          </Text>
        </TouchableOpacity>
        {!selectedKey && <Text style={styles.errorText}>Tom é obrigatório</Text>}

        {/* Botão para mostrar/ocultar notas */}
        <TouchableOpacity
          onPress={() => setShowNotesInput(!showNotesInput)}
          style={styles.toggleNotesButton}
        >
          <FontAwesomeIcon 
            icon={showNotesInput ? faEyeSlash : faEye} 
            size={16} 
            color="#fff" 
            style={styles.toggleIcon}
          />
          <Text style={styles.toggleNotesText}>
            {showNotesInput ? "Ocultar notas" : "Adicionar notas"}
          </Text>
        </TouchableOpacity>

        {/* Campo de notas */}
        {showNotesInput && (
          <>
            <Text style={styles.inputLabel}>Notas musicais</Text>
            <TextInput
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ex: <D><D#>m <C> <C#>"
              placeholderTextColor="#8e99cc"
            />
            {!inputText && <Text style={styles.errorText}>Notas são obrigatórias</Text>}
          </>
        )}

        {/* Preview das notas convertidas */}
        {selectedKey && inputText && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Preview:</Text>
            <Text style={styles.previewText}>
              {inputText.replace(/<|>/g, "")}
            </Text>
          </View>
        )}

        {/* Botão salvar */}
        <TouchableOpacity
          onPress={handleSaveMusic}
          disabled={!inputName || !selectedKey || !inputText || loading}
          style={[styles.saveButton, (!inputName || !selectedKey || !inputText || loading) && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Salvando..." : "Criar música"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de seleção de tom - PADRONIZADO igual ao da edição */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha um tom</Text>
            <ScrollView style={styles.modalScrollView}>
              {Object.keys(NOTES_MAP).map((key) => (
                <TouchableOpacity 
                  key={key} 
                  onPress={() => handleChangeKey(key)} 
                  style={[
                    styles.modalOption,
                    selectedKey === key && styles.modalOptionSelected
                  ]}
                >
                  <Text style={[
                    styles.modalOptionText,
                    selectedKey === key && styles.modalOptionTextSelected
                  ]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)} 
              style={styles.modalCloseButton}
            >
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
    backgroundColor: "#101323",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight! + 10 : 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'SplineSans-Bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "#fff",
    fontFamily: 'SplineSans-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  inputName: {
    backgroundColor: "#171c36",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'SplineSans-Regular',
    color: "#ffffff",
    marginBottom: 4,
  },
  keySelector: {
    backgroundColor: "#171c36",
    borderRadius: 8,
    padding: 15,
    marginBottom: 4,
  },
  keySelectorText: {
    color: "#ffffff",
    fontFamily: 'SplineSans-Regular',
    fontSize: 16,
    textAlign: "center",
  },
  toggleNotesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#171c36",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  toggleIcon: {
    marginRight: 8,
  },
  toggleNotesText: {
    color: "#ffffff",
    fontFamily: 'SplineSans-Regular',
    fontSize: 16,
  },
  input: {
    backgroundColor: "#171c36",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'SplineSans-Regular',
    color: "#ffffff",
    lineHeight: 24,
    textAlignVertical: "top",
    minHeight: 200,
    marginBottom: 4,
  },
  previewContainer: {
    backgroundColor: "#171c36",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  previewLabel: {
    fontSize: 14,
    fontFamily: 'SplineSans-Bold',
    color: "#8e99cc",
    marginBottom: 8,
  },
  previewText: {
    fontSize: 18,
    fontFamily: 'SplineSans-Regular',
    color: "#fff",
    lineHeight: 26,
  },
  saveButton: {
    backgroundColor: "#607afb",
    borderRadius: 8,
    padding: 15,
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: "#2a3548",
  },
  saveButtonText: {
    color: "#ffffff",
    fontFamily: 'SplineSans-Bold',
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    fontFamily: 'SplineSans-Regular',
    marginBottom: 8,
  },
  // Modal styles - PADRONIZADO igual ao da edição
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#21284a",
    borderRadius: 12,
    width: "85%",
    maxHeight: "70%",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'SplineSans-Bold',
    color: "#fff",
    textAlign: 'center',
    marginBottom: 16,
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalOption: {
    backgroundColor: "#171c36",
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  modalOptionSelected: {
    backgroundColor: "#607afb",
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'SplineSans-Regular',
    color: "#fff",
    textAlign: "center",
  },
  modalOptionTextSelected: {
    fontFamily: 'SplineSans-Bold',
  },
  modalCloseButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'SplineSans-Bold',
    textAlign: "center",
  },
});