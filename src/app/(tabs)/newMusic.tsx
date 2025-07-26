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
import {  faCheck } from '@fortawesome/free-solid-svg-icons';
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

// Mapeamento de notas enarmônicas (equivalentes)
const ENHARMONIC_MAP: { [key: string]: string } = {
    "C#": "Db", "Db": "C#",
    "D#": "Eb", "Eb": "D#", 
    "F#": "Gb", "Gb": "F#",
    "G#": "Ab", "Ab": "G#",
    "A#": "Bb", "Bb": "A#"
};

// Função para normalizar nota para o formato padrão (sempre com #)
const normalizeNote = (note: string): string => {
    const cleanNote = note.replace(/[^A-Gb#♭]/g, ''); // Remove sufixos como 'm'
    
    // Converte bemol para sustenido equivalente
    const bemolToSustenido: { [key: string]: string } = {
        "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#"
    };
    
    return bemolToSustenido[cleanNote] || cleanNote;
};

// Função de transposição IGUAL à da tela de listagem (com suporte a enarmônicos)
const transposeNotes = (inputText: string, fromKey: string, toKey: string): string => {
    if (!fromKey || !toKey || fromKey === toKey) return inputText;

    const fromScale = NOTES_MAP[fromKey];
    const toScale = NOTES_MAP[toKey];

    return inputText.replace(/<([A-Gb#♭]+[^>]*)>/g, (match: string, note: string) => {
        // Extrai a nota base (A-G seguido de # ou b)
        const noteMatch = note.match(/^([A-G][#♭b]?)/);
        if (!noteMatch) return match;
        
        let rootNote = noteMatch[1];
        const suffix = note.replace(rootNote, "");
        
        // Normaliza diferentes formatos de bemol
        rootNote = rootNote.replace('♭', 'b');
        
        // Normaliza a nota para o formato padrão (#)
        const normalizedNote = normalizeNote(rootNote);
        
        // Procura a nota na escala original
        let index = fromScale.indexOf(normalizedNote);
        
        // Se não encontrar, tenta com todas as variações enarmônicas
        if (index === -1) {
            const variations = [
                rootNote,
                ENHARMONIC_MAP[rootNote],
                ENHARMONIC_MAP[normalizedNote],
                normalizedNote
            ].filter(Boolean);
            
            for (const variation of variations) {
                index = fromScale.indexOf(variation);
                if (index !== -1) break;
            }
        }
        
        return index !== -1 ? `<${toScale[index]}${suffix}>` : match;
    });
};

// Função para detectar se o tom é menor baseado no conteúdo da música
const detectKeyType = (notes: string, currentKey: string): 'major' | 'minor' => {
    const minorPatterns = [
        new RegExp(`<${currentKey}m>`, 'gi'),
        new RegExp(`${currentKey}m`, 'gi'),
        /minor/gi,
        /menor/gi
    ];
    
    for (const pattern of minorPatterns) {
        if (pattern.test(notes)) {
            return 'minor';
        }
    }
    
    return 'major';
};

export default function NewMusic() {
  const [inputName, setInputName] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [keyType, setKeyType] = useState<'major' | 'minor'>('major');
  const [showErrors, setShowErrors] = useState<boolean>(false);
  const [shouldTransposeNotes, setShouldTransposeNotes] = useState<boolean>(false);

  const musicDatabase = useMusicDatabase();
  const router = useRouter();

  // Alterna entre maior e menor
  const toggleKeyType = () => {
    setKeyType(keyType === 'major' ? 'minor' : 'major');
  };

  // Obtém a exibição do tom com o 'm' se for menor
  const getDisplayKey = () => {
    if (!selectedKey) return "Selecione um Tom";
    return keyType === 'minor' ? `${selectedKey}m` : selectedKey;
  };

  // Atualiza as notas ao mudar o tom (com opção de transpor)
  const handleChangeKey = (newKey: string) => {
    if (shouldTransposeNotes && selectedKey) {
      // Usa a mesma lógica EXATA da tela de listagem
      setInputText(transposeNotes(inputText, selectedKey, newKey));
    }
    setSelectedKey(newKey);
    setModalVisible(false);
  };

  const handleSaveMusic = async () => {
    // Validação dos campos obrigatórios
    if (!inputName.trim() || !selectedKey || !inputText.trim()) {
      setShowErrors(true);
      Toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      await musicDatabase.saveMusic(inputName, selectedKey, inputText, keyType === 'minor');
      Toast.success("Música salva com sucesso");
      setLoading(false);
      setTimeout(() => {
        router.navigate("/(tabs)");
      }, 3000);
      setInputName("");
      setSelectedKey("");
      setInputText("");
      setKeyType('major');
      setShowErrors(false);
    } catch (error) {
      console.error("Error saving music", error);
      Toast.error("Erro ao salvar música");
      setLoading(false);
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
          placeholderTextColor="#8e99cc"
        />
        {showErrors && !inputName && <Text style={styles.errorText}>Nome é obrigatório</Text>}

        <Text style={styles.inputLabel}>Tom da música:</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.keySelector}>
          <Text style={styles.keySelectorText}>
            {selectedKey ? `Tom: ${getDisplayKey()}` : "Selecione um Tom"}
          </Text>
        </TouchableOpacity>
        {showErrors && !selectedKey && <Text style={styles.errorText}>Tom é obrigatório</Text>}

        {/* Maior/Menor */}
        {selectedKey && (
          <TouchableOpacity onPress={toggleKeyType} style={styles.keyTypeButton}>
            <Text style={styles.keyTypeText}>
              {keyType === 'major' ? 'Maior' : 'Menor'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Opção para transpor notas */}
        <TouchableOpacity
          onPress={() => setShouldTransposeNotes(!shouldTransposeNotes)}
          style={styles.transposeOption}
        >
          <View style={[styles.checkbox, shouldTransposeNotes && styles.checkboxActive]}>
            {shouldTransposeNotes && (
              <FontAwesomeIcon icon={faCheck} size={12} color="#fff" />
            )}
          </View>
          <Text style={styles.transposeOptionText}>
            Transpor notas ao mudar tom
          </Text>
        </TouchableOpacity>

        <Text style={styles.inputLabel}>Digite as notas:</Text>
        <TextInput
          multiline
          numberOfLines={10}
          textAlignVertical="top"
          style={styles.input}
          value={inputText}
          onChangeText={(text) => setInputText(text)}
          placeholder="Ex: <D><D#>m <C> a <C#>"
          placeholderTextColor="#8e99cc"
        />

        {showErrors && !inputText && <Text style={styles.errorText}>Notas são obrigatórias</Text>}

        {selectedKey && (
          <>
            <Text style={styles.convertedNotesLabel}>Notas Convertidas:</Text>
            <Text style={styles.convertedNotes}>{inputText.replace(/<|>/g, "")}</Text>
          </>
        )}

        <TouchableOpacity disabled={!inputName || !selectedKey || !inputText || loading} onPress={handleSaveMusic} style={styles.btnCreate}>
          <Text style={styles.keySelectorText}>{loading ? "Carregando" : "Salvar música"}</Text>
        </TouchableOpacity>

      </ScrollView>

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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight! + 10 : 10,
    padding: 20,
    backgroundColor: "#101323",
  },

  keySelector: {
    width: "100%",
    padding: 15,
    backgroundColor: "#171c36",
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 10,
  },

  btnCreate: {
    width: "100%",
    padding: 15,
    backgroundColor: "#607afb",
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 10,
  },

  keySelectorText: {
    color: "#ffffff",
    fontFamily: 'SplineSans-Regular',
    fontSize: 18,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 16,
    color: "#fff",
    fontFamily: 'SplineSans-Bold',
    marginTop: 8,
    marginBottom: 8,
  },
  inputName: {
    color: "#ffffff",
    borderWidth: 0,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#171c36",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10
  },
  input: {
    borderWidth: 0,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#171c36",
    color: "#ffffff",
    fontFamily: 'SplineSans-Regular',
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
    color: "#fff",
    fontFamily: 'SplineSans-Bold',
  },
  convertedNotes: {
    fontSize: 20,
    color: "#8e99cc",
    fontFamily: 'SplineSans-Regular',
    marginTop: 10,
    marginBottom: 10,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    fontFamily: 'SplineSans-Regular',
    marginTop: 4,
    marginBottom: 8,
  },
  keyTypeButton: {
    backgroundColor: "#607afb",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  keyTypeText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'SplineSans-Bold',
  },
  transposeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#8e99cc",
    backgroundColor: "transparent",
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: "#607afb",
    borderColor: "#607afb",
  },
  transposeOptionText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'SplineSans-Regular',
    flex: 1,
  },
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
