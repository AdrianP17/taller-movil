import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuthContext } from '../../../context/AuthContext';
import { Notification } from '../../../types';
import { useNavigation } from '@react-navigation/native';
import { deleteDoc } from 'firebase/firestore';

export const AlertsScreen: React.FC = () => {
  const { firebaseUser } = useAuthContext();
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser?.uid) return;

    setLoading(true);

    const q = query(
      collection(db, 'notifications'),
      where('targetUid', '==', firebaseUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Notification[] = snapshot.docs
          .map((document) => {
            const docData = document.data();

            return {
              notificationId: document.id,
              targetUid: docData.targetUid,
              title: docData.title,
              body: docData.body,
              type: docData.type,
              isRead: docData.isRead,
              relatedAppointmentId: docData.relatedAppointmentId,
              createdAt: docData.createdAt?.toDate(),
            };
          })
          .sort(
            (a, b) =>
              b.createdAt.getTime() - a.createdAt.getTime()
          );

        setNotifications(data);

        setNotifications(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error cargando notificaciones:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser?.uid]);

  const markAsRead = async (notificationId: string) => {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
    });
  };

  const markAllAsRead = async () => {
    if (!firebaseUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('targetUid', '==', firebaseUser.uid),
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((docSnap) => {
      if (!docSnap.data().isRead) {
        batch.update(docSnap.ref, { isRead: true });
      }
    });

    await batch.commit();
  };

  const deleteNotification = async (notificationId: string) => {
    await deleteDoc(doc(db, 'notifications', notificationId));
  };
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Cargando notificaciones...</Text>
      </View>
    );
  }
  if (notifications.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>No tienes notificaciones nuevas</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* BOTÓN GLOBAL */}
      <TouchableOpacity style={styles.markAll} onPress={markAllAsRead}>
        <Text style={styles.markAllText}>Marcar todas como leídas</Text>
      </TouchableOpacity>

      <FlatList
        contentContainerStyle={styles.container}
        data={notifications}
        keyExtractor={(item) => item.notificationId}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.isRead && styles.unread]}>
            <TouchableOpacity
              onPress={() => markAsRead(item.notificationId)}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </TouchableOpacity>

            <View style={styles.actions}>
              <Button
                title="Ver cita"
                onPress={() => {
                  markAsRead(item.notificationId);
                  navigation.navigate("Mis Citas");
                }}
              />

              <Button
                title="Eliminar"
                onPress={() => deleteNotification(item.notificationId)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  unread: {
    backgroundColor: '#EEF2FF',
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5'
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  body: {
    color: '#6B7280',
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  markAll: {
    padding: 12,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
  },
  markAllText: {
    fontWeight: '600',
    color: '#4338CA',
  },
});