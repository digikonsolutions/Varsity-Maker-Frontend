import React from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SizeChart from "./components/SizeChart";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import EliteCollectionPage from "./pages/EliteCollectionPage";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import SingleBlogPage from './pages/SingleBlog.jsx';
import { Routes, Route } from "react-router-dom";
import ChatWidget from './components/ChatWidget.jsx';
import CollectionPage from './pages/CollectionsPage.jsx';
import ProductPage from './pages/ProductsPage.jsx';
import ProductDetail from './pages/SingleProductPage.jsx';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Faqs from './pages/FAQPage.jsx';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/Privacypolicy.jsx';
import Termsandcondition from './pages/termsandconditions.jsx';
import RefundPolicy from './pages/Refundpolicy.jsx';
import Shippingpolicy from './pages/ShippingPolicy.jsx';
import UserRegisterPage from './pages/UserManagementPages/pages/Register.jsx';
import UserLoginPage from './pages/UserManagementPages/pages/Login.jsx';
import UserDashboard from './pages/UserManagementPages/pages/UserDashboard.jsx';
import CartPage from './pages/CartDrawer.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ThankYouPage from './pages/ThankYouPage.jsx';
import ReferralTracker from './components/ReferralTracker.jsx';
import GiftCardPage from './pages/Giftcard.jsx';
import Patchesandemroiderypage from './pages/PatchesEmbroidery.jsx';
import Colorsandmaterialpages from './pages/Colorsandmaterialpages.jsx';
import DonotSellMyDataPage from './pages/DoNotSellData.jsx';
import SchoolRegistrationFormPage from './pages/SchoolRegistrationForm.jsx'
import HowItWorksPage from './pages/HowItWorks.jsx';
import WholesalePage from './pages/WholesalePage.jsx';
import CollaboratorsPage from './pages/Collaborations.jsx';
import LettermanJacketBuilderpage from './pages/Jacketbuilder/LettermanJackets/LettermanJackets.jsx';
import Leatherjacketbuilder from './pages/Jacketbuilder/Leathervarsityjacket/Leathervarsityjacket.jsx';
import BandCollarVarsityJacketBuilder from './pages/Jacketbuilder/Bandcollarvarsityjacket/Bandcollarvarsityjacket.jsx';
import BomberVarsityJacket from './pages/Jacketbuilder/Bombervarsityjacket/Bombervarsityjacket.jsx';
import ClassicBandCollarVarsityJacket from './pages/Jacketbuilder/Classicbandcollarvarsityjacket/Classicbandcollarvarsityjacket.jsx';
import HoodedVarsityJacket from './pages/Jacketbuilder/Hoodedvarsityjacket/Hoodedvarsityjacket.jsx';
import OverlapStandupCollarVarsityJacket from './pages/Jacketbuilder/Overlapstandupcollarvarsityjacket/Overlapstandupcollarvarsityjacket.jsx';
import RetroVarsityJacketBuilder from './pages/Jacketbuilder/Retrovarsityjacket/Retrovarsityjacket.jsx';
import SailorVarsityJacket from './pages/Jacketbuilder/Sailorvarsityjacket/Sailorvarsityjacket.jsx';
import ZipperHoodedvarsityJacket from './pages/Jacketbuilder/Zipperhoodedvarsityjacket/Zipperhoodedvarsityjacket.jsx'; 
import RaglanVarsityJacket from './pages/Jacketbuilder/Raglanvarsityjacket/Raglanvarsityjacket.jsx';
import Croppedvarsityjacket from './pages/Jacketbuilder/croppedvarsityjacket/croppedvarsityjacket.jsx';
import PageLoader from './components/AIPageLoader.jsx';

export default function App() {
  return (
    <>
    
      {/* Navbar stays outside Routes so it's visible on all pages */}
      <ToastContainer position="top-right" autoClose={2000} />
      <Navbar />
      <ReferralTracker/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/varsity-collection" element={<EliteCollectionPage />} />
        
        {/* Blog routes */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="blog/categories" element={<Blog />} />
        <Route path="blog/categories/:id" element={<BlogDetail />} />
        <Route path="blog/singleblog/:id" element={<SingleBlogPage />} />
        
        {/* Size Chart Route */}
        <Route path="/size-chart" element={<SizeChart />} />

        {/* colletion page route */ }
        <Route path="/categories" element={<CollectionPage/>}></Route>

        {/* products page */}
        <Route path="/products/categories/:slug" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Faqs page route */}
        <Route path="/faqs" element={<Faqs/>}></Route>


        {/* contact us page route */}
        <Route path="/contact" element={<Contact/>}> </Route>

        {/* policies pages routes */}
        <Route path="/privacy-policy" element={<PrivacyPolicy/>}></Route>
        <Route path="/terms-and-conditions" element={<Termsandcondition/>}></Route>
        <Route path="/refund-policy" element={<RefundPolicy/>}></Route>
        <Route path="/shipping-policy" element={<Shippingpolicy/>}></Route>

        {/* Auth pages routes */}
        <Route path="/register" element={<UserRegisterPage/>}></Route>
        <Route path="/login" element={<UserLoginPage/>}></Route>
        <Route path="/dashboard" element={<UserDashboard/>}></Route>

        {/* Cart pages routes */}
        <Route path="/cart" element={<CartPage/>}></Route>
        <Route path="/checkout" element={<CheckoutPage/>}></Route>
        <Route path="/thank-you/:id" element={<ThankYouPage/>}></Route>

        {/* Giftcard pages routes */}
        <Route path="/gift-card" element={<GiftCardPage/>}></Route>

        {/* patches and emroidery materials and colors pages routes */}
        <Route path="/patches-embroidery" element={<Patchesandemroiderypage/>}></Route>
        <Route path="/colorsandmaterials" element={<Colorsandmaterialpages/>}></Route>
        <Route path="/do-not-sell" element={<DonotSellMyDataPage/>}></Route>

        {/* School Registration Form page routes */}
        <Route path="/school-registration-form" element={<SchoolRegistrationFormPage/>}></Route>

        {/* How it works page routes */}
        <Route path='/how-it-works' element={<HowItWorksPage/>}></Route>

        {/* wholesale and collaboration pages routes */}
        <Route path='/wholesale' element={<WholesalePage/>}></Route>
        <Route path="/our-collaborators" element={<CollaboratorsPage/>}></Route>

        {/* Builders pages routes */}
        <Route path="/builder/lettermanjacketbuilder" element={<LettermanJacketBuilderpage/>}></Route>
        <Route path="/builder/leatherjacketbuilder" element={<Leatherjacketbuilder/>}></Route>
        <Route path="/builder/raglanvarsityjacketbuilder" element={<RaglanVarsityJacket/>}></Route>
        <Route path="/builder/bombervarsityjacketbuilder" element={<BomberVarsityJacket/>}></Route>
        <Route path="/builder/classicbandedcollarvarsityjacketbuilder" element={<ClassicBandCollarVarsityJacket/>}></Route>
        <Route path="/builder/hoodedvarsityjacketbuilder" element={<HoodedVarsityJacket/>}></Route>
        <Route path="/builder/overlapstandupcollarvarsityjacketbuilder" element={<OverlapStandupCollarVarsityJacket/>}></Route>
        <Route path="/builder/retrovarsityjacketbuilder" element={<RetroVarsityJacketBuilder/>}></Route>
        <Route path="/builder/sailorvarsityjacketbuilder" element={<SailorVarsityJacket/>}></Route>
        <Route path="/builder/zipperhoodedvarsityjacket" element={<ZipperHoodedvarsityJacket/>}></Route>
        <Route path="/builder/croppedvarsityjacketbuilder" element={<Croppedvarsityjacket/>}></Route>



      </Routes>

      {/* Footer also visible on all pages */}
      <Footer />
    <ChatWidget />
   
    </>
    
  );
}