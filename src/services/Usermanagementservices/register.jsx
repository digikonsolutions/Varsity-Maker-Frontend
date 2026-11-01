import axios from 'axios';
import {baseurl, register} from '../../constants/baseurls.jsx';

export async function Registeruser(name, email, password) {
    try {
        const res = await axios.post(`${baseurl}${register}`, {
            name: name,
            email: email,
            password: password,
        });

        return res.data;
    } catch (error) {
        throw error;
    }
} 