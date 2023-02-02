import { createSlice } from '@reduxjs/toolkit';
import nookies from 'nookies';

import {
  becomeCreator,
  changePassword,
  deleteAccount,
  forgotPassword,
  loginUser,
  logout,
  registerUser,
} from '../../actions/authActions';

export interface IAuth {
  token: string;
  userProfileId: string;
  userRole: string;
  isLoading: boolean;
  isAuth: boolean;
  error: unknown | string;
  isChange: string | null;
}

const cookies = nookies.get(null);

const initialState: IAuth = {
  token: cookies.authToken ?? '',
  userProfileId: cookies.userId ?? '',
  userRole: cookies.userRole ?? '',
  isLoading: false,
  isAuth: Boolean(cookies.authToken),
  error: '',
  isChange: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = initialState.error;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(changePassword.pending, (state) => {
      state.isChange = 'success';
    });
    builder.addCase(changePassword.rejected, (state) => {
      state.isChange = 'false';
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.isLoading = false;
      state.error = '';
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuth = true;
      state.error = '';
      state.token = action.payload.access_token;
      state.userProfileId = action.payload.user_profile_id;
      state.userRole = action.payload.user_role;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    builder.addCase(forgotPassword.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(forgotPassword.fulfilled, (state) => {
      state.isLoading = false;
      state.error = '';
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    builder.addCase(deleteAccount.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(deleteAccount.fulfilled, (state) => {
      state.isLoading = false;
      state.isAuth = false;
      state.error = '';
      state.token = '';
      state.userProfileId = '';
      state.userRole = '';
    });
    builder.addCase(deleteAccount.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    builder.addCase(becomeCreator.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(becomeCreator.fulfilled, (state) => {
      state.isLoading = false;
      state.userRole = 'creator';
    });
    builder.addCase(becomeCreator.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.isAuth = false;
      state.error = '';
      state.token = '';
      state.userProfileId = '';
      state.userRole = '';
      nookies.destroy(null, 'authToken');
      nookies.destroy(null, 'userId');
      nookies.destroy(null, 'userRole');
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export const authReducer = authSlice.reducer;
