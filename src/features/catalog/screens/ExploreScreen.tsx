import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../../context/AuthContext';
import { useBusinesses } from '../hooks/useBusinesses';
import { BusinessCard } from '../components/BusinessCard';
import { Business } from '../../../types';

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userData } = useAuthContext();
  const { businesses, isLoading, error } = useBusinesses();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar negocios por nombre
  const filteredBusinesses = useMemo(() => {
    if (!searchQuery.trim()) return businesses;

    const query = searchQuery.toLowerCase().trim();
    return businesses.filter(business =>
      business.name.toLowerCase().includes(query)
    );
  }, [businesses, searchQuery]);

  const firstName = userData?.fullName?.split(' ')[0] ?? 'Usuario';

  const onRefresh = async () => {
    setRefreshing(true);
    // El hook useBusinesses ya maneja la actualización en tiempo real
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleBusinessPress = (business: Business) => {
    navigation.navigate('BusinessDetail', { businessId: business.businessId });
  };

  const renderListHeader = useCallback(() => (
    <Text style={styles.sectionTitle}>
      {searchQuery ? `RESULTADOS (${filteredBusinesses.length})` : 'NEGOCIOS DISPONIBLES'}
    </Text>
  ), [searchQuery, filteredBusinesses.length]);

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🏪</Text>
        <Text style={styles.emptyTitle}>No hay negocios disponibles</Text>
        <Text style={styles.emptySubtitle}>
          Vuelve más tarde para ver nuevos negocios
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }


  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>⚠️</Text>
      <Text style={styles.emptyTitle}>Error al cargar</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
    </View>
  );

  if (error) {
    return (
      <View style={styles.container}>
        {renderError()}
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header con saludo y búsqueda fuera del FlatList */}
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola, {firstName}! 👋</Text>
        <Text style={styles.subtitle}>Encuentra tu próxima cita perfecta</Text>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar negocios..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Text
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              ✕
            </Text>
          )}
        </View>
      </View>

      <FlatList
        data={filteredBusinesses}
        keyExtractor={(item) => item.businessId}
        renderItem={({ item }) => (
          <BusinessCard business={item} onPress={() => handleBusinessPress(item)} />
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={filteredBusinesses.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7C3AED"
            colors={['#7C3AED']}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  emptyList: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  clearButton: {
    fontSize: 16,
    color: '#9CA3AF',
    paddingHorizontal: 8,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
