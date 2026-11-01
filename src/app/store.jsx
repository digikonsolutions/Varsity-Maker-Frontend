import {configureStore} from '@reduxjs/toolkit'
import productReducer  from '../slices/products/productslice.jsx';
import chatbotreducer from '../slices/chatbot/chatbotslice.jsx';
import collectionsslice from '../slices/collections/collectionsslice.jsx';
import collectionproductsSlice from '../slices/products/collectionproductslice.jsx';
import SingleproductSlice from '../slices/products/singleproductslice.jsx';
import ReviewsubmitSlice from '../slices/reviews/reviewsslice.jsx';
import createaddreviewreplyslice from '../slices/reviewreply/addreviewreply.jsx';
import blogcategoriesslice from '../slices/blogcategories/blogcategoriesslice.jsx';
import Subscribeourcommunityslice from '../slices/subscription/subscriptionslice.jsx';
import createblogsbycategoryslice from '../slices/blogsbycategoryid/blogsbycategoryidslice.jsx';
import getsingleblogslice from '../slices/singleblogbyid/getsingleblogbyid.jsx';
import getlatestblogsslice from '../slices/latestblogs/latestblogsslice.jsx';
import contactsendmessageslice from '../slices/sendmessage/sendcontactmessageslics.jsx';
import registeruserslice from '../slices/registeruser/registeruserslice.jsx';
import loginuserslice from '../slices/loginuser/loginuserslice.jsx';
import cartSlice from '../slices/cart/cartSlice.jsx';
import getmyordersbyuserslice from '../slices/myorders/myordersfordashboardslice.jsx';
import trackorderslice from '../slices/trackorder/trackorderslice.jsx';
import creategetrefferalSlice from '../slices/affiliate/getrefferalslice.jsx';
import createaffiliateslice from '../slices/affiliate/createaffiliateslice.jsx';
import createaffiliatedashboardslice from '../slices/affiliate/affiliatedashboardslice.jsx';
import getpatchesslice from '../slices/patches/patchesslice.jsx';
import colorsandmaterialsslice from '../slices/colorsandmaterials/colorsandmaterialsslice.jsx';
import schoolRegistrationSlice from '../slices/schoolregistration/schoolregistrationslice.jsx';


export const store = configureStore({
    reducer:{
        products: productReducer,
        chatbot: chatbotreducer,
        collections: collectionsslice,
        collectionProducts: collectionproductsSlice,
        singleproduct: SingleproductSlice,
        submitreview : ReviewsubmitSlice,
        addreviewreply: createaddreviewreplyslice,
        blogcategories : blogcategoriesslice,
        subscriptions: Subscribeourcommunityslice,
        blogsbycategory: createblogsbycategoryslice,
        singleblog: getsingleblogslice,
        latestblogs: getlatestblogsslice,
        contact: contactsendmessageslice,
        userregister: registeruserslice,
        loginuser : loginuserslice,
        cart : cartSlice,
        myordersbyuser: getmyordersbyuserslice,
        trackorder: trackorderslice,
        getrefferal: creategetrefferalSlice,
        createaffiliate: createaffiliateslice,
        affiliatedasboard: createaffiliatedashboardslice,
        patches: getpatchesslice,
        colorsandmaterials: colorsandmaterialsslice,
        schoolRegistration: schoolRegistrationSlice,

    }
})