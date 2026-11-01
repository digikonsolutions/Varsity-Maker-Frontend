import axios from "axios";
import {baseurl, schoolregistration} from '../constants/baseurls.jsx';

const API_URL = `${baseurl}${schoolregistration}`;

export const createSchoolRegistration = async (formData) => {
  const response = await axios.post(API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};