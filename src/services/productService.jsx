import React from 'react'
import axios from 'axios';
import {baseurl, getallproducts, getproductsbyslug} from '../constants/baseurls.jsx';


async function fetchproductsAPI() {
  try {
    const response = await axios.get(`${baseurl}${getallproducts}`);

    console.log("Products response:", response.data);

    return response.data; 
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

async function fetchproductsAPIbyslug(slug){
    try {
        const response = await axios.get(`${baseurl}${getproductsbyslug}/${slug}`);
        console.log('collections products', response);
        return response.data;
    } catch (error) {
        throw error;
    }
}


async function fetchsingleproductAPIbyid(id){
    try {
        const response = await axios.get(`${baseurl}${getallproducts}/${id}`);
        console.log(response.data);
        return response;
    } catch (error) {
        throw error;
        
    }
}

export {fetchproductsAPI, fetchproductsAPIbyslug, fetchsingleproductAPIbyid};