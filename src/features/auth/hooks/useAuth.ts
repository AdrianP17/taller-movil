import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../services/firebase";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para REGISTRAR
  const registerUser = async (email: string, password: string, fullName: string, role: 'client' | 'business_owner', phone?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName,
        role,
        ...(phone ? { phone } : {}),
        deviceTokens: [],
        createdAt: serverTimestamp(),
      });

      return user;
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para INICIAR SESIÓN
  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para CERRAR SESIÓN
  const logoutUser = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || 'Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerUser,
    loginUser,
    logoutUser,
    isLoading,
    error,
  };
};
