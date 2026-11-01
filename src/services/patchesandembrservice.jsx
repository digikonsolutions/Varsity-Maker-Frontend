import axios from 'axios';
import {baseurl, patches} from '../constants/baseurls.jsx';


export async function getpatches(){
    try {
        const res = await axios.get(`${baseurl}${patches}`);
        return res.data;
    } catch (error) {
        throw error;
    }
}