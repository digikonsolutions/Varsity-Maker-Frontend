import axios from 'axios';
import { baseurl, myorders } from '../constants/baseurls.jsx';

export async function getmyordersbyuser() {
    const token = localStorage.getItem('user_token'); 
    
    try {
        console.log('Target API Endpoint:', `${baseurl}${myorders}`);
        
        const res = await axios.get(`${baseurl}${myorders}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        console.log('Database Data Received:', res.data);
        return res.data; 

    } catch (error) {
        console.log('--- ❌ SERVER API ERROR LOGGED ---');
        
            
        throw error;
    }
}