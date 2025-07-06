
import { useMusicDatabase } from "@/src/database/musicDatabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faX, faEye, faEyeSlash, faCheck } from '@fortawesome/free-solid-svg-icons';
import { MusicType } from "../(tabs)";
import ToastManager, { Toast } from "toastify-react-native";

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

const transposeNotes = (inputText: string, fromKey: string, toKey: string): string => {
    if (!fromKey || !toKey || fromKey === toKey) return inputText;

    const fromScale = NOTES_MAP[fromKey];
    const toScale = NOTES_MAP[toKey];

    return inputText.replace(/<([A-G]#?[^>]*)>/g, (match: string, note: string) => {
        const matchResult = note.match(/[A-G]#?/);
        const rootNote = matchResult ? matchResult[0] : "";
        const suffix = note.replace(rootNote, "");

        const index = fromScale.indexOf(rootNote);
        return index !== -1 ? `<${toScale[index]}${suffix}>` : match;
    });
};

export default function ListMusic() {
    const { id } = useLocalSearchParams();
    const musicDatabase = useMusicDatabase();
    const router = useRouter();

    const [inputName, setInputName] = useState<string>("");
    const [selectedKey, setSelectedKey] = useState<string>("");
    const [inputText, setInputText] = useState<string>("");
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showNotesInput, setShowNotesInput] = useState<boolean>(false);
    const [shouldTransposeNotes, setShouldTransposeNotes] = useState<boolean>(false);

    // Alteração: Agora verifica se deve transpor as notas baseado na opção do usuário
    const handleChangeKey = (newKey: string) => {
        if (shouldTransposeNotes && selectedKey) {
            setInputText(transposeNotes(inputText, selectedKey, newKey));
        }
        setSelectedKey(newKey);
        setModalVisible(false);
    };

    async function getMusicById() {
        try {
            const result = await musicDatabase.getMusicById(Number(id));
            const musicData = result[0] as MusicType;
            setInputName(musicData.title);
            setSelectedKey(musicData.tone);
            setInputText(musicData.notes);
        } catch (error) {
            console.error(error);
        }
    }

    const handleSaveMusic = async () => {
        setLoading(true);
        try {
            await musicDatabase.editMusic(Number(id), inputName, selectedKey, inputText);
            Toast.success("Música editada com sucesso");
            setLoading(false);
            setTimeout(() => {
                router.navigate("/(tabs)");
            }, 2000);
        } catch (error) {
            console.error("Error saving music", error);
            Toast.error("Erro ao editar música");
            setLoading(false);
        }
    }

    useEffect(() => {
        getMusicById();
    }, [id]);

    return (
        <View style={styles.container}>
            <ToastManager width={300} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Editar Música</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <FontAwesomeIcon icon={faX} size={20} color="#fff" />
                </TouchableOpacity>
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

                {/* Opção para transpor notas */}
                {/* <TouchableOpacity
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
                </TouchableOpacity> */}

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
                        {showNotesInput ? "Ocultar notas" : "Editar notas"}
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
                        {loading ? "Salvando..." : "Salvar alterações"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modal de seleção de tom */}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'SplineSans-Bold',
        color: '#fff',
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#171c36',
        borderRadius: 6,
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
    // Modal styles
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