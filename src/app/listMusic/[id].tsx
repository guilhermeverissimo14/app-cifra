import { useMusicDatabase } from "@/src/database/musicDatabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faHeart, faPen, faMusic, faUpDown } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { MusicType } from "../(tabs)";

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

// Função de transposição com suporte completo a enarmônicos
// Agora reconhece equivalências: C# = Db, D# = Eb, F# = Gb, G# = Ab, A# = Bb
// Exemplo: <Db> será transposto corretamente como equivalente a <C#>
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

export default function ViewMusic() {
    const { id } = useLocalSearchParams();
    const musicDatabase = useMusicDatabase();
    const router = useRouter();

    const [music, setMusic] = useState<MusicType | null>(null);
    const [currentKey, setCurrentKey] = useState<string>("");
    const [originalKey, setOriginalKey] = useState<string>(""); // NOVO: Tom original da música
    const [displayedNotes, setDisplayedNotes] = useState<string>("");
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [keyType, setKeyType] = useState<'major' | 'minor'>('major');

    // CORRIGIDO: Lógica igual à da edição
    const handleChangeKey = (newKey: string) => {
        if (music && originalKey) {
            // Transpõe das notas originais para o novo tom
            const transposedNotes = transposeNotes(music.notes, originalKey, newKey);
            setDisplayedNotes(transposedNotes.replace(/<|>/g, ""));
        }
        setCurrentKey(newKey);
        setModalVisible(false);
    };

    const toggleKeyType = () => {
        setKeyType(keyType === 'major' ? 'minor' : 'major');
    };

    const getDisplayKey = () => {
        if (!currentKey) return "";
        return keyType === 'minor' ? `${currentKey}m` : currentKey;
    };

    const handleFavoriteToggle = async () => {
        try {
            await musicDatabase.updateFavorite(Number(id), !isFavorite);
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error("Error updating favorite", error);
        }
    };

    async function getMusicById() {
        try {
            const result = await musicDatabase.getMusicById(Number(id));
            const musicData = result[0] as MusicType;
            setMusic(musicData);
            setCurrentKey(musicData.tone);
            setOriginalKey(musicData.tone); // NOVO: Salva o tom original
            setDisplayedNotes(musicData.notes.replace(/<|>/g, ""));
            setIsFavorite(musicData.favorite);
            
            // Detecta automaticamente se é maior ou menor
            const detectedType = detectKeyType(musicData.notes, musicData.tone);
            setKeyType(detectedType);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getMusicById();
    }, [id]);

    if (!music) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header minimalista */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <FontAwesomeIcon icon={faArrowLeft} size={20} color="#8e99cc" />
                </TouchableOpacity>
                
                <View style={styles.headerCenter}>
                    <FontAwesomeIcon icon={faMusic} size={16} color="#8e99cc" />
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleFavoriteToggle} style={styles.headerButton}>
                        <FontAwesomeIcon 
                            icon={isFavorite ? faHeart : faHeartRegular} 
                            size={20} 
                            color={isFavorite ? "#ff6b6b" : "#8e99cc"} 
                        />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={() => router.push({ pathname: "/editMusic/[id]", params: { id: String(id) } })} 
                        style={styles.headerButton}
                    >
                        <FontAwesomeIcon icon={faPen} size={18} color="#8e99cc" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Informações da música */}
            <View style={styles.musicInfo}>
                <Text style={styles.musicTitle}>{music.title}</Text>
                
                <View style={styles.keyContainer}>
                    <TouchableOpacity 
                        onPress={() => setModalVisible(true)} 
                        style={styles.keySelector}
                    >
                        <FontAwesomeIcon icon={faUpDown} size={14} color="#8e99cc" style={styles.keySelectorIcon} />
                        <Text style={styles.keyText}>Tom: {getDisplayKey()}</Text>
                    </TouchableOpacity>
                    
                    {/* Botão para alternar entre maior/menor */}
                    <TouchableOpacity onPress={toggleKeyType} style={styles.keyTypeButton}>
                        <Text style={styles.keyTypeText}>
                            {keyType === 'major' ? 'Maior' : 'Menor'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Área principal das notas */}
            <ScrollView 
                style={styles.notesContainer} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.notesContent}
            >
                <Text style={styles.notesText}>{displayedNotes}</Text>
            </ScrollView>

            {/* Modal de mudança de tom */}
            <Modal visible={modalVisible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Mudar tom</Text>
                        <Text style={styles.modalSubtitle}>Tom atual: {getDisplayKey()}</Text>
                        
                        <View style={styles.keysGrid}>
                            {Object.keys(NOTES_MAP).map((key) => (
                                <TouchableOpacity 
                                    key={key} 
                                    onPress={() => handleChangeKey(key)} 
                                    style={[
                                        styles.keyOption,
                                        currentKey === key && styles.keyOptionActive
                                    ]}
                                >
                                    <Text style={[
                                        styles.keyOptionText,
                                        currentKey === key && styles.keyOptionTextActive
                                    ]}>
                                        {key}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <TouchableOpacity 
                            onPress={() => setModalVisible(false)} 
                            style={styles.modalCloseButton}
                        >
                            <Text style={styles.modalCloseText}>Fechar</Text>
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#171c36',
    },
    headerButton: {
        padding: 8,
        borderRadius: 6,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    musicInfo: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#171c36',
    },
    musicTitle: {
        fontSize: 28,
        fontFamily: 'SplineSans-Bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
    },
    keyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    keySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#171c36',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    keySelectorIcon: {
        marginRight: 8,
    },
    keyText: {
        fontSize: 16,
        fontFamily: 'SplineSans-Medium',
        color: '#8e99cc',
    },
    keyTypeButton: {
        backgroundColor: '#607afb',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    keyTypeText: {
        fontSize: 12,
        fontFamily: 'SplineSans-Bold',
        color: '#fff',
        textTransform: 'uppercase',
    },
    notesContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    notesContent: {
        paddingVertical: 32,
        paddingBottom: 100,
    },
    notesText: {
        fontSize: 22,
        fontFamily: 'SplineSans-Regular',
        color: '#fff',
        lineHeight: 36,
        textAlign: 'left',
    },
    loadingText: {
        fontSize: 18,
        fontFamily: 'SplineSans-Regular',
        color: '#8e99cc',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#21284a",
        borderRadius: 16,
        width: "90%",
        padding: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: 'SplineSans-Bold',
        color: "#fff",
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        fontFamily: 'SplineSans-Regular',
        color: "#8e99cc",
        textAlign: 'center',
        marginBottom: 24,
    },
    keysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    keyOption: {
        backgroundColor: "#171c36",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: 50,
        alignItems: 'center',
    },
    keyOptionActive: {
        backgroundColor: "#607afb",
    },
    keyOptionText: {
        fontSize: 16,
        fontFamily: 'SplineSans-Medium',
        color: "#fff",
    },
    keyOptionTextActive: {
        fontFamily: 'SplineSans-Bold',
    },
    modalCloseButton: {
        backgroundColor: "#171c36",
        borderRadius: 12,
        paddingVertical: 16,
    },
    modalCloseText: {
        color: "#8e99cc",
        fontSize: 16,
        fontFamily: 'SplineSans-Medium',
        textAlign: "center",
    },
});