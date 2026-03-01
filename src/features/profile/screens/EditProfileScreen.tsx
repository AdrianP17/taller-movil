import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthContext } from '../../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useNavigation } from '@react-navigation/native';

export const EditProfileScreen: React.FC = () => {
    const { userData } = useAuthContext();

    const [fullName, setFullName] = useState(userData?.fullName ?? '');
    const [phone, setPhone] = useState(userData?.phone ?? '');
    const [isLoading, setIsLoading] = useState(false);

    const { firebaseUser, refreshUserData } = useAuthContext();

    const navigation = useNavigation();

    const handleSave = async () => {
        if (!firebaseUser) return;

        try {
            setIsLoading(true);

            await updateDoc(doc(db, 'users', firebaseUser.uid), {
                fullName,
                phone,
            });

            await refreshUserData();
            alert('Perfil actualizado');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            alert('Error al actualizar');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleSave}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#F9FAFB',
    },
    label: {
        marginBottom: 4,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#7C3AED',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    cancelButton: {
        marginTop: 12,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#7C3AED',
    },
    cancelButtonText: {
        color: '#7C3AED',
        fontWeight: '600',
    },
});