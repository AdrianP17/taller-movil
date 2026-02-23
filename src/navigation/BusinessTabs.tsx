import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutGrid, Wrench, Bell } from 'lucide-react-native';
import { PanelScreen } from '../features/appointments/screens/PanelScreen';
import { ServicesScreen } from '../features/catalog/screens/ServicesScreen';
import { AlertsScreen } from '../features/profile/screens/AlertsScreen';
import { AppHeader } from '../components/AppHeader';

const Tab = createBottomTabNavigator();

export const BusinessTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        header: () => <AppHeader />,
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Panel"
        component={PanelScreen}
        options={{
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Servicios"
        component={ServicesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Wrench size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Alertas"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
          tabBarBadge: 0,
        }}
      />
    </Tab.Navigator>
  );
};
