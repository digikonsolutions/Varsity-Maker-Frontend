import react from 'react';
import axios from 'axios';
import {baseurl, subscribeourcommunity} from '../constants/baseurls.jsx';

export async function Subscribeourcommunity(email) {
    try {
        const res = await axios.post(`${baseurl}${subscribeourcommunity}`, {
            email: email
        });

        console.log(res);
        return res.data;
    } catch (error) {
        throw error;
    }
}
