import axios from 'axios';
import {baseurl, colorsandmaterials} from '../constants/baseurls.jsx';

export async function getcolorsandmaterials(){
    try {
        const res = await axios.get(`${baseurl}${colorsandmaterials}`);
        return res.data;
    } catch (error) {
        throw error;
    }
}