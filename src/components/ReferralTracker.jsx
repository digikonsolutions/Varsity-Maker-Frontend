// src/components/ReferralTracker.jsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { GetRefferalThunk } from '../slices/affiliate/getrefferalslice.jsx';

const ReferralTracker = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const referralCode = urlParams.get('ref');

        if (!referralCode) return;

        console.log("Ref code found:", referralCode);

        const alreadyTracked = sessionStorage.getItem('ref_tracked');
        if (alreadyTracked === referralCode) {
            console.log("Already tracked this session");
            return;
        }

        dispatch(GetRefferalThunk(referralCode))
            .unwrap()
            .then((res) => {
                console.log("Click tracked successfully:", res);
                sessionStorage.setItem('ref_tracked', referralCode);
                localStorage.setItem('ref_code', referralCode); 
            })
            .catch((err) => {
                console.error("Tracking failed:", err);
            });

    }, []); 

    return null; 
};

export default ReferralTracker;