import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Loginuser} from '../../services/Usermanagementservices/login.jsx';

export const loginuserThunk = createAsyncThunk(
    "loginuser/loginuserThunk",

    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await Loginuser(email, password);
            return res;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Invalid credentials"
            );
        }
    }
);


const loginuserslice = createSlice({
    name : 'loginuser',
    initialState: {
        items: null,
        loading: false,
        error: null
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(loginuserThunk.pending, (state) => {
                state.loading = true;
            })

            .addCase(loginuserThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })

            .addCase(loginuserThunk.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload || "Login failed";
});
    }
})

export default loginuserslice.reducer;