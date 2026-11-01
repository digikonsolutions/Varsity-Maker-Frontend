import axios from 'axios';
import {baseurl, trackorders} from '../constants/baseurls.jsx';

export async function trackmyorder(trackingnumber) {
    try {
        const res = await axios.get(`${baseurl}${trackorders}/${trackingnumber}`);
        console.log(res.data);
        return res.data;
    } catch (error) {
        throw error;
    }
}