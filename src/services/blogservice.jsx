import react from 'react';
import axios from 'axios';
import {baseurl, getallblogsbycategoryID, getsingleblogbyid, getlatestblogs} from '../constants/baseurls.jsx';

export async function FetchblogsbycategoryID(id) {
    try {
        const res = await axios.get(`${baseurl}${getallblogsbycategoryID}${id}`);
        return res.data;
    } catch (error) {
        throw error;
    }
} 


export async function GetsingleblogbyID(id) {
    try {
        const res = await axios.get(`${baseurl}${getsingleblogbyid}/${id}`);
        console.log('single blog', res);
        return res.data;
    } catch (error) {
        throw error;
    }
}


export async function GetLatestBlogs() {
    try {
        const res = await axios.get(`${baseurl}${getlatestblogs}`);
        console.log('latest blogs', res);
        return res.data;
    } catch (error) {
        throw error;
    }
}