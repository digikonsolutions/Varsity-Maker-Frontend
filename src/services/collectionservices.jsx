import react from 'react';
import axios from 'axios';
import {collections, baseurl} from '../constants/baseurls.jsx';

async function fetchallcollections(){
    try {
        const res = await axios.get(`${baseurl}${collections}`);
        console.log(res);
        return res.data.data;
    } catch (error) {
        throw error;
    }
}

export {fetchallcollections}