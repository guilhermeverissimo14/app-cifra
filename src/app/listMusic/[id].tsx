import { useMusicDatabase } from "@/src/database/musicDatabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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

export default function ListMusic() {

    const { id } = useLocalSearchParams();
    const musicDatabase = useMusicDatabase();
    const router = useRouter();

    const [inputName, setInputName] = useState<string>("");
    const [selectedKey, setSelectedKey] = useState<string>(""); // Inicia sem tom
    const [inputText, setInputText] = useState<string>("");
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [tonnerLarger, setTonnerLarger] = useState<boolean>(true);


    const handleChangeKey = (newKey: string) => {
        if (selectedKey) {
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
            }, 3000);
            setInputName("");
            setSelectedKey("");
            setInputText("");
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

                <View style={styles.boxModals}>
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.keySelector}>
                        <Text style={styles.keySelectorText}>
                            {selectedKey ? `Tom Atual: ${selectedKey}` : "Selecione um Tom"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setTonnerLarger(!tonnerLarger)} style={styles.toneLager}>
                        <Text style={styles.toneLagerText}>{tonnerLarger ? "+" : "-"}</Text>
                    </TouchableOpacity>
                </View>
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

                <TouchableOpacity
                    onPress={handleSaveMusic}
                    disabled={!inputName || !selectedKey || !inputText || loading}
                    style={styles.btnCreate}
                >
                    <Text style={styles.keySelectorText}>{loading ? "Carregando..." : "Editar música"}</Text>
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

    boxModals: {
        flexDirection: "row",
        alignItems: "center",
    },

    keySelector: {
        width: "75%",
        padding: 15,
        backgroundColor: "#a9a9a9",
        borderRadius: 10,
        marginBottom: 5,
        marginTop: 10,
    },

    toneLager: {
        width: "20%",
        padding: 13,
        backgroundColor: "#a9a9a9",
        borderRadius: 10,
        marginBottom: 5,
        marginTop: 10,
        marginLeft: 5,
        alignItems: "center",
    },

    toneLagerText: {
        color: "#111",
        fontSize: 22,
        textAlign: "center",
    },


    btnCreate: {
        width: "100%",
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