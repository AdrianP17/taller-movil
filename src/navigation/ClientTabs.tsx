import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, CalendarDays, Bell } from 'lucide-react-native';
import { ExploreScreen } from '../features/catalog/screens/ExploreScreen';
import { BusinessDetailScreen } from '../features/catalog/screens/BusinessDetailScreen';
import { MyAppointmentsScreen } from '../features/appointments/screens/MyAppointmentsScreen';
import { AlertsScreen } from '../features/profile/screens/AlertsScreen';
import { AppHeader } from '../components/AppHeader';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuthContext } from "../context/AuthContext";
import { useEffect, useState } from "react";

const Tab = createBottomTabNavigator();
const ExploreStack = createNativeStackNavigator();

const ExploreStackNavigator: React.FC = () => {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="ExploreList" component={ExploreScreen} />
      <ExploreStack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
    </ExploreStack.Navigator>
  );
};

export const ClientTabs: React.FC = () => {
  const { firebaseUser } = useAuthContext();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!firebaseUser) return;

    const q = query(
      collection(db, "notifications"),
      where("targetUid", "==", firebaseUser.uid),
      where("isRead", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [firebaseUser]);
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
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
        name="Explorar"
        component={ExploreStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Mis Citas"
        component={MyAppointmentsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Alertas"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
};
