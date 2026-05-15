import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWixData, WixApiResponse } from '@/app/lib/wixApi';
import { router } from 'expo-router';
import LoadingScreen from '@/components/LoadingScreen';
import { localStorage, StoredUser } from '@/app/lib/localStorage';
import StatusAlert from '@/components/StatusAlert';

interface AuthContextType {
  user: StoredUser | null;
  wixData: WixApiResponse | null;
  loading: boolean;
  chosenIndex: number;
  setChosenIndex: (index: number) => void;
  setWixData: (data: WixApiResponse | null) => void;
  refreshWixData: () => Promise<void>;
  logout: () => Promise<void>;
  clearStoredAccountChoice: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [wixData, setWixData] = useState<WixApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [chosenIndex, setChosenIndex] = useState(0);
  const [fetchingWixData, setFetchingWixData] = useState(false);
  const [showDataLoading, setShowDataLoading] = useState(false);
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  const [alertStatus, setAlertStatus] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [alertDisplayName, setAlertDisplayName] = useState('');
  const [alertOptions, setAlertOptions] = useState<any[]>([]);

  const fetchUserWixData = async (currentUser: StoredUser) => {
    if (fetchingWixData) {
      console.log('Already fetching Wix data, skipping...');
      return;
    }
    
    setFetchingWixData(true);
    setShowDataLoading(true);
    try {
      console.log('Fetching Wix data for user:', currentUser.email);
      
      const fullName = currentUser.displayName || currentUser.email?.split('@')[0] || '';
      
      console.log('Using name for Wix API:', fullName);
      
      if (!currentUser.email || !fullName || fullName.trim() === '') {
        console.error('Missing required data for Wix API call:', { 
          email: currentUser.email, 
          name: fullName 
        });
        throw new Error('Missing email or name for Wix API call');
      }
      
      const data = await fetchWixData(
        currentUser.email,
        fullName.trim()
      );
      console.log('Wix data received:', data);
      
      if (data.status === 'timeout' || data.message?.includes('timeout')) {
        console.warn('Wix API request timed out');
        setWixData({
          message: 'The request is taking longer than expected. Please try again.',
          status: 'timeout'
        });
      }
      else if (['noStudent', 'noMatchingStudent', 'multipleMatchingStudent', 'noMusicscoodle', 'noValidMusicscoodle'].includes(data.status)) {
        console.log(`Status ${data.status} detected, showing alert`);
        setAlertStatus(data.status);
        setAlertEmail(currentUser.email || '');
        setAlertDisplayName(fullName);
        setAlertOptions(data.options || []);
        setShowStatusAlert(true);
        return;
      }
      else {
        setWixData(data);
        setChosenIndex(0);
      }
    } catch (error) {
      console.error('Error fetching Wix data:', error);
      
      if (error.message?.includes('timeout') || error.message?.includes('taking too long')) {
        setWixData({
          message: 'The request is taking longer than expected. Please check your connection and try again.',
          status: 'timeout'
        });
      } else {
        setWixData({
          message: 'Failed to fetch data. Please check your connection and try again.',
          status: 'error'
        });
      }
    } finally {
      setFetchingWixData(false);
      setTimeout(() => setShowDataLoading(false), 500);
    }
  };

  const handleStatusAlertClose = async () => {
    setShowStatusAlert(false);
    setAlertStatus('');
    setAlertEmail('');
    setAlertDisplayName('');
    setAlertOptions([]);
    await logout();
  };

  const handleStudentSelection = async (studentId: string) => {
    if (!user) return;
    
    try {
      console.log('Selected student ID:', studentId);
      setShowStatusAlert(false);
      setShowDataLoading(true);
      
      const fullName = user.displayName || user.email?.split('@')[0] || '';
      
      const data = await fetchWixData(user.email || '', fullName, studentId);
      console.log('Wix data received after selection:', data);
      
      if (data.status === 'success' || data.status === 'ok') {
        setWixData(data);
        setChosenIndex(0);
      } else {
        setAlertStatus(data.status);
        setAlertEmail(user.email || '');
        setAlertDisplayName(fullName);
        setAlertOptions(data.options || []);
        setShowStatusAlert(true);
      }
    } catch (error) {
      console.error('Error in student selection:', error);
      setWixData({
        message: 'Failed to fetch data. Please check your connection and try again.',
        status: 'error'
      });
    } finally {
      setFetchingWixData(false);
      setTimeout(() => setShowDataLoading(false), 500);
    }
  };

  const refreshWixData = async () => {
    if (user && !fetchingWixData) {
      await fetchUserWixData(user);
    }
  };

  const clearStoredAccountChoice = async () => {
    setChosenIndex(0);
    await refreshWixData();
  };

  const updateChosenIndex = async (newIndex: number) => {
    setChosenIndex(newIndex);
    console.log('Successfully updated chosen index to:', newIndex);
  };

  const logout = async () => {
    try {
      console.log('Logging out user...');
      await localStorage.removeUser();
      setUser(null);
      setWixData(null);
      setChosenIndex(0);
      setFetchingWixData(false);
      setShowDataLoading(false);
      setLoading(false);
      router.replace('/auth/login');
      console.log('Successfully logged out');
    } catch (error) {
      console.error('Logout error (non-blocking):', error);
      setUser(null);
      setWixData(null);
      setChosenIndex(0);
      setFetchingWixData(false);
      setShowDataLoading(false);
      setLoading(false);
      router.replace('/auth/login');
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        const storedUser = await localStorage.getUser();
        
        if (mounted) {
          console.log('Stored user found:', !!storedUser);
          
          if (storedUser) {
            console.log('Found existing user:', storedUser.email);
            setUser(storedUser);
            
            if (storedUser.displayName && storedUser.email) {
              fetchUserWixData(storedUser).catch(console.error);
            } else {
              console.warn('Missing user data, skipping Wix data fetch');
            }
          } else {
            setUser(null);
            setWixData(null);
          }
          
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setWixData(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  if (showDataLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <AuthContext.Provider value={{ 
        user, 
        wixData, 
        loading, 
        chosenIndex, 
        setChosenIndex: updateChosenIndex,
        setWixData,
        refreshWixData, 
        logout, 
        clearStoredAccountChoice 
      }}>
        {children}
      </AuthContext.Provider>
      
      <StatusAlert
        visible={showStatusAlert}
        status={alertStatus}
        email={alertEmail}
        displayName={alertDisplayName}
        options={alertOptions}
        onClose={handleStatusAlertClose}
        onSelectStudent={handleStudentSelection}
      />
    </>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}