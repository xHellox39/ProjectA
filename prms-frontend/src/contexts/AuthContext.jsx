import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authApi, getApiError } from '../api';

/* ------------------------------------------------------------------ */
/*  Actions                                                        */
/* ------------------------------------------------------------------ */

const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT',
};

/* ------------------------------------------------------------------ */
/*  Reducer                                                        */
/* ------------------------------------------------------------------ */

const initialState = {
  loading: true,
  user: null,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_USER:
      return { ...state, loading: false, user: action.payload, error: null };
    case ACTIONS.SET_ERROR:
      return { ...state, loading: false, error: action.payload };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case ACTIONS.LOGOUT:
      return { ...initialState, loading: false };
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  Context                                                        */
/* ------------------------------------------------------------------ */

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /* ------------------------------------------------------------------ */
  /*  Register                                                         */
  /* ------------------------------------------------------------------ */

  const register = useCallback(
    async (data, navigate) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ACTIONS.CLEAR_ERROR });
      try {
        await authApi.register(data);
        if (navigate) navigate('/login');
        return { success: true };
      } catch (err) {
        const msg = getApiError(err);
        dispatch({ type: ACTIONS.SET_ERROR, payload: msg });
        return { success: false, error: msg };
      }
    },
    []
  );

  /* ------------------------------------------------------------------ */
  /*  Login                                                            */
  /* ------------------------------------------------------------------ */

  const login = useCallback(
    async ({ email, password }, navigate) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ACTIONS.CLEAR_ERROR });
      try {
        const { data } = await authApi.login({ email, password });
        
        const accessToken =
        data?.data?.tokens?.accessToken ||
        data?.accessToken ||
        data?.token;
        
        const refreshToken =
        data?.data?.tokens?.refreshToken ||
        data?.refreshToken ||
        data?.refresh_token;

        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        /* Fetch current user */
        const { data: meData } = await authApi.getMe();
        
        const user =
        meData?.data?.user ||
        meData?.user ||
        meData;

        dispatch({ type: ACTIONS.SET_USER, payload: user });

        /* Redirect based on role */
        if (navigate) {
          const path = roleToPath(user.role);
          localStorage.setItem('prmsDashboardPath', path);
          navigate(path);
        }

        return { success: true, user };
      } catch (err) {
        const msg = getApiError(err);
        dispatch({ type: ACTIONS.SET_ERROR, payload: msg });
        return { success: false, error: msg };
      }
    },
    []
  );

  /* ------------------------------------------------------------------ */
  /*  Logout                                                           */
  /* ------------------------------------------------------------------ */

  const logout = useCallback(
    async (navigate) => {
      try {
        await authApi.logout();
      } catch {
        /* best-effort — clear locally regardless */
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      if (navigate) navigate('/login');
      dispatch({ type: ACTIONS.LOGOUT });
    },
    []
  );

  /* ------------------------------------------------------------------ */
  /*  Update profile                                                   */
  /* ------------------------------------------------------------------ */

  const updateProfile = useCallback(async (data) => {
    try {
      const { data: res } = await authApi.updateMe(data);
      const updated = res.user || res;
      dispatch({ type: ACTIONS.SET_USER, payload: updated });
      return { success: true, user: updated };
    } catch (err) {
      const msg = getApiError(err);
      dispatch({ type: ACTIONS.SET_ERROR, payload: msg });
      return { success: false, error: msg };
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Hydration on mount — restore session from localStorage           */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return;
    }

    authApi
      .getMe()
      .then(({ data }) => {
        dispatch({ type: ACTIONS.SET_USER, payload: data.user || data });
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      });
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Value                                                            */
  /* ------------------------------------------------------------------ */

  const value = {
    loading: state.loading,
    user: state.user,
    error: state.error,
    isAuthenticated: !!state.user,
    register,
    login,
    logout,
    updateProfile,
    clearError: () => dispatch({ type: ACTIONS.CLEAR_ERROR }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                           */
/* ------------------------------------------------------------------ */

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                        */
/* ------------------------------------------------------------------ */

function roleToPath(role) {
  if (!role) return '/admin';
  const lower = role.toLowerCase();
  if (lower.includes('landlord')) return '/landlord';
  if (lower.includes('tenant')) return '/tenant';
  if (lower.includes('admin')) return '/';
  return '/admin';
}

export { AuthProvider, useAuth, AuthContext };
