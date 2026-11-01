import axios from 'axios';
import {baseurl, referral, createaffiliate, affiliatedashboard} from '../constants/baseurls.jsx';

export async function Getreferral(code) {
    try {
        const res = await axios.get(`${baseurl}${referral}/${code}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};


export async function CreateAffiliate(data) {
    try {
        const res = await axios.post(
            `${baseurl}${createaffiliate}`,
            data,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return res.data;

    } catch (error) {
        console.error("Affiliate Create Error:", error.response?.data || error.message);
        throw error;
    }
};


export async function Affiliatedashboard(){
    try {
        const token = localStorage.getItem('user_token');
        console.log('user_token', token);
        const res = await axios.get(`${baseurl}${affiliatedashboard}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        console.log(res);
        return res.data;
    } catch (error) {
        throw error;
    }
}