import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  user: null | { _id: string; name: string; email: string; avatar?: string; role: string };
  isAuthenticated: boolean;
}

const initialUserState: UserState = { user: null, isAuthenticated: false };

const userSlice = createSlice({
  name: "user",
  initialState: initialUserState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState["user"]>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

interface UIState {
  darkMode: boolean;
  mobileMenuOpen: boolean;
}
const initialUIState: UIState = { darkMode: false, mobileMenuOpen: false };

const uiSlice = createSlice({
  name: "ui",
  initialState: initialUIState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export const { toggleDarkMode, setMobileMenu } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
