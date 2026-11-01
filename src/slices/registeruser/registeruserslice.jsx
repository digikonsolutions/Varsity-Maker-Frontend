import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Registeruser} from '../../services/Usermanagementservices/register.jsx';

export const registeruserThunk = createAsyncThunk(
    'userregister/registeruserThunk',

    async({name, email, password}, {rejectWithValue}) => {
        try {
            const res = await Registeruser(name, email, password);
            return res;
        } catch (error) {
            return rejectWithValue(error?.response?.data || "error");
        }
    }
);


const registeruserslice = createSlice({
    name: 'userregister',
    initialState : {
        items : null,
        loading : false,
        error: null,
    },
    reducers : {},

    extraReducers: (builder) => {
        builder
            .addCase(registeruserThunk.pending, (state) => {
                state.loading = true;
            })

            .addCase(registeruserThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })

            .addCase(registeruserThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

    } 
});

export default registeruserslice.reducer;