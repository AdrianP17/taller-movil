import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthContext } from '../../../context/AuthContext';

export const PanelScreen: React.FC = () => {
  const { userData } = useAuthContext();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📊</Text>
        <Text style={styles.title}>Panel</Text>
        <Text style={styles.subtitle}>
          Bienvenido, {userData?.fullName ?? 'Dueño'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});
