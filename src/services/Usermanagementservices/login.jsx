import axios from 'axios';
import { baseurl, login } from '../../constants/baseurls.jsx';

export async function Loginuser(email, password) {
    try {
        const res = await axios.post(`${baseurl}${login}`, {
            email: email,
            password: password,
        });
        console.log(res.data);
        return res.data;

    } catch (error) {
        const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
        
        return { success: false, error: errorMessage };
    }
}