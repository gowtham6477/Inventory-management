import { useState, useEffect, createContext, useContext } from 'react';
import apiClient from '@/api/client'; 

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        if (payload.exp * 1000 > Date.now()) {
          setUser({
            id: payload.id,              
            email: payload.email,
            name: payload.name,          
            role: payload.role,
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Token parse error:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email, password, name, role) => {
    try {
      const response = await apiClient.post('/auth/signup', {
        email,
        password,
        name,
        role,
      });

      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser({
        id: userData.id || userData._id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      });

      return { data: { user: userData }, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser({
        id: userData.id || userData._id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      });

      return { data: { user: userData }, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
