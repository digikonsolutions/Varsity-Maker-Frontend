import react from 'react';
import axios from 'axios';
import {baseurl, getallblogcategories} from '../constants/baseurls.jsx';


export async function getallblogcategoriesAPI() {
    try {
        const response = await axios.get(`${baseurl}${getallblogcategories}`);
        console.log(response);
        return response.data;
    } catch (error) {
        throw error;
    }
}