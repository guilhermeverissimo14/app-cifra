
import { View, StyleSheet, TextInput, KeyboardTypeOptions, Text } from 'react-native';

import { Controller } from 'react-hook-form';


interface InputProps {
    name: string;
    // control: any;
    placeholder?: string;
    rules?: object;
    error?: string;
    keyboardType: KeyboardTypeOptions;
}

export function Input({ name, placeholder, rules, error, keyboardType }: Readonly<InputProps>) {
    return (
        <View style={styles.container} >
            {/* <Controller
                // control={control}
                name={name}
                rules={rules}

                render={({ field: { onChange, onBlur, value } }) => ( */}
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        // onBlur={onBlur} 
                        // value={value}
                        // onChangeText={onChange}
                        keyboardType={keyboardType}
                    />
                {/* )}
            /> */}

            {error && <Text style={styles.errorText}>{error}</Text>}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '80%'
    },
    input: {
        height: 44,
        backgroundColor: "#ffff",
        paddingHorizontal: 10,
        borderRadius: 4
    },
    errorText: {
        color: "red",
        marginTop: 4
    }
})