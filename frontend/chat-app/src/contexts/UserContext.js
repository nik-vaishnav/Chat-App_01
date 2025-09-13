import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';

// Create the UserContext
const UserContext = createContext();

// Action types
const USER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED'
};

// Initial state
const initialState = {
  currentUser: null,
  name: '',
  isAuthenticated: false,
  isLoading: true,
  error: null,
  token: null
};

// Deep object comparison utility
const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  const keys1 = Object.keys(obj1), keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every(key => keys2.includes(key) && deepEqual(obj1[key], obj2[key]));
};

// Reducer
const userReducer = (state, action) => {
  switch (action.type) {
    case USER_ACTIONS.SET_LOADING:
      return state.isLoading === action.payload ? state : { ...state, isLoading: action.payload };

    case USER_ACTIONS.SET_USER: {
      const { user, token } = action.payload;
      const name = user?.name || '';
      if (
        deepEqual(state.currentUser, user) &&
        state.token === token &&
        state.name === name &&
        state.isAuthenticated && !state.isLoading
      ) return state;
      return {
        ...state,
        currentUser: user,
        token,
        name,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    }

    case USER_ACTIONS.UPDATE_USER: {
      const updatedUser = { ...state.currentUser, ...action.payload };
      return deepEqual(state.currentUser, updatedUser)
        ? state
        : { ...state, currentUser: updatedUser, name: action.payload.name || state.name };
    }

    case USER_ACTIONS.SET_ERROR:
      return state.error === action.payload ? state : { ...state, error: action.payload, isLoading: false };

    case USER_ACTIONS.CLEAR_ERROR:
      return state.error ? { ...state, error: null } : state;

    case USER_ACTIONS.LOGOUT:
      return state.isAuthenticated || state.currentUser || state.token
        ? { ...initialState, isLoading: false }
        : { ...state, isLoading: false };

    case USER_ACTIONS.SET_AUTHENTICATED:
      return (state.isAuthenticated === action.payload && !state.isLoading)
        ? state
        : { ...state, isAuthenticated: action.payload, isLoading: false };

    default:
      return state;
  }
};

// ✅ Use REACT_APP_BACKEND_URL not REACT_APP_API_URL
const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL
    ? `${process.env.REACT_APP_BACKEND_URL}/api`
    : 'http://localhost:8080/api';

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const validationInProgress = useRef(false);
  const lastValidationTime = useRef(0);
  const initializationComplete = useRef(false);

  const apiCall = useCallback(async (endpoint, options = {}) => {
    const token = state.token || localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API request failed');
    return data;
  }, [state.token]);

  const register = useCallback(async (userData) => {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await apiCall('/auth/signUp', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('name', response.user.name);
        dispatch({ type: USER_ACTIONS.SET_USER, payload: { token: response.token, user: response.user } });
        return { success: true, data: response };
      }
      return { success: true, message: 'Registration successful. Please login.' };
    } catch (error) {
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
    }
  }, [apiCall]);

  const login = useCallback(async (credentials) => {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('name', response.user.name);
        dispatch({ type: USER_ACTIONS.SET_USER, payload: { token: response.token, user: response.user } });
        return { success: true, data: response };
      }
      throw new Error('Invalid response format from server');
    } catch (error) {
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
    }
  }, [apiCall]);

  const logout = useCallback(async () => {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout request failed:', err.message);
    }
    localStorage.clear();
    dispatch({ type: USER_ACTIONS.LOGOUT });
  }, [apiCall]);

  const validateToken = useCallback(async () => {
    const now = Date.now();
    if (validationInProgress.current || (now - lastValidationTime.current) < 2000) return state.isAuthenticated;
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: USER_ACTIONS.SET_AUTHENTICATED, payload: false });
      return false;
    }

    validationInProgress.current = true;
    lastValidationTime.current = now;

    try {
      const response = await apiCall('/auth/validate-token');
      if (response.success && response.data?.user) {
        dispatch({ type: USER_ACTIONS.SET_USER, payload: { user: response.data.user, token } });
        return true;
      } else {
        dispatch({ type: USER_ACTIONS.SET_AUTHENTICATED, payload: false });
        return false;
      }
    } catch {
      localStorage.clear();
      dispatch({ type: USER_ACTIONS.LOGOUT });
      return false;
    } finally {
      validationInProgress.current = false;
    }
  }, [apiCall, state.isAuthenticated]);

  const updateUser = useCallback((userData) => {
    const updated = { ...state.currentUser, ...userData };
    localStorage.setItem('currentUser', JSON.stringify(updated));
    localStorage.setItem('name', updated.name || '');
    dispatch({ type: USER_ACTIONS.UPDATE_USER, payload: userData });
  }, [state.currentUser]);

  const forgotPassword = useCallback(async (email) => {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: USER_ACTIONS.CLEAR_ERROR });
    try {
      const response = await apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      return { success: response.success, message: response.message };
    } catch (error) {
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [apiCall]);

  const resetPassword = useCallback(async (token, newPassword) => {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: USER_ACTIONS.CLEAR_ERROR });
    try {
      const response = await apiCall('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword })
      });
      return { success: response.success, message: response.message };
    } catch (error) {
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [apiCall]);

  const refreshToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const response = await apiCall('/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ token })
      });
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        return true;
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.warn('Token refresh failed:', err.message);
      logout();
      return false;
    }
  }, [apiCall, logout]);

  const getProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token provided');
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    const contentType = response.headers.get('content-type');
    if (!response.ok) throw new Error(await response.text());
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return { success: true, data: data.user || data.data || data };
    }
    throw new Error('Expected JSON, but got non-JSON response');
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: USER_ACTIONS.CLEAR_ERROR });
  }, []);

  useEffect(() => {
    if (initializationComplete.current) return;

    const init = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('currentUser');

      if (token && storedUser) {
        let user;
        try {
          user = JSON.parse(storedUser);
        } catch (e) {
          console.warn('⚠️ Corrupted stored user JSON, clearing storage.');
          localStorage.clear();
          dispatch({ type: USER_ACTIONS.LOGOUT });
          initializationComplete.current = true;
          return;
        }

        dispatch({ type: USER_ACTIONS.SET_USER, payload: { token, user } });
        await validateToken();
      } else {
        dispatch({ type: USER_ACTIONS.SET_AUTHENTICATED, payload: false });
      }

      initializationComplete.current = true;
    };

    init();
  }, [validateToken]);

  const contextValue = useMemo(() => ({
    currentUser: state.currentUser,
    name: state.name,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    token: state.token,
    register,
    login,
    logout,
    validateToken,
    getProfile,
    updateUser,
    forgotPassword,
    resetPassword,
    refreshToken,
    clearError,
    setName: (name) => updateUser({ name }),
    setCurrentUser: updateUser,
    dispatch
  }), [
    state.currentUser, state.name, state.isAuthenticated,
    state.isLoading, state.error, state.token,
    register, login, logout, validateToken,
    getProfile, updateUser, forgotPassword,
    resetPassword, refreshToken, clearError
  ]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

export { UserContext };
