import axios from 'axios';
import { baseurl, contactmessages } from '../constants/baseurls.jsx';

export async function sendcontactmessage(firstname, lastname, email, message, agree, consent) {
    try {
        const res = await axios.post(`${baseurl}${contactmessages}`, {
            first_name: firstname,
            last_name: lastname,
            email: email,
            message: message,
            agree: agree,
            consent: consent,
        });
console.log(res);
        return res.data;
        
    } catch (error) {
        throw error;
    }
}