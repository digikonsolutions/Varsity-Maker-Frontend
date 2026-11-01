import React from 'react';
import axios from 'axios';
import {baseurl, reviews, getallproducts} from '../constants/baseurls.jsx';

async function submitreview(id, comment, rating, name, email,){
    try {
        const res = await axios.post(
            `${baseurl}${getallproducts}/${id}${reviews}`,
            {
                name: name,
                comment: comment,
                rating: rating,
                email: email,
            }
        );
        return res.data;
    } catch (error) {
        
    }
}


async function getsubmittedreviews(id){
    try {
        const res = await axios.get(`${baseurl}${getallproducts}/${id}${reviews}`);
        return res.data;
    } catch (error) {
        throw error;
    }
}

export {submitreview, getsubmittedreviews}