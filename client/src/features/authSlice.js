import { createSlice } from '@reduxjs/toolkit';

const userFromStorage = localStorage.getItem('boltUser')
  ? JSON.parse(localStorage.getItem('boltUser'))
  : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: userFromStorage },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('boltUser', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('boltUser');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
