import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthContext } from '../context/AuthContext';
import { AuthStack } from './AuthStack';
import { ClientTabs } from './ClientTabs';
import { BusinessTabs } from './BusinessTabs';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { BusinessSetupScreen } from '../features/auth/screens/BusinessSetupScreen';

const MainStack = createNativeStackNavigator();

const AuthenticatedNavigator: React.FC<{ role?: string; needsSetup: boolean }> = ({ role, needsSetup }) => {
  const TabsComponent = role === 'business_owner' ? BusinessTabs : ClientTabs;

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      {needsSetup ? (
        <MainStack.Screen name="BusinessSetup" component={BusinessSetupScreen} />
      ) : (
        <>
          <MainStack.Screen name="Tabs" component={TabsComponent} />
          <MainStack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </MainStack.Navigator>
  );
};

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, userData, hasBusiness } = useAuthContext();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  const needsSetup = userData?.role === 'business_owner' && !hasBusiness;

  return <AuthenticatedNavigator role={userData?.role} needsSetup={needsSetup} />;
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});
