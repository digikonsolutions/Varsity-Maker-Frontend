import Hero from "../components/Hero";
import Stats from "../components/Stats";
import BestSellers from "../components/BestSellers";
import CarterSection from "../components/CarterSection";
import Categories from "../components/Categories";
import DesignCTA from "../components/DesignCTA";
import Testimonials from "../components/Testimonials";
import Community from "../components/Community";
import OurProcess from "../components/OurProcess";
import TestimonialBanner from "../components/TestimonialBanner";
import CarterShowcase from "../components/CarterShowcase";
import Collage from "../components/Collage";
import OurStory from "../components/OurStory";
import OnTheGram from "../components/OnTheGram";
import CollectionsGrid from '../components/CollectionGrid.jsx';
import Categoriesswiper from '../components/CollectionGrid.jsx';
import DesignYourJacket from '../components/DesignYourJacket.jsx';
import Trustbadges from '../components/TrustBadges.jsx';
import Whychooseus from '../components/VarsityInfographic.jsx';
import Trustedschols from '../components/TrustedSchools.jsx';
import OurRecentBlogs from '../components/RecentBlogs.jsx';
import Faqs from '../components/FAQ.jsx';
import Manufactureprocess from '../components/ManufacturingProcess.jsx';
import CollectionSection from '../components/RelatedCategories.jsx';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Trustbadges />
      <BestSellers />
      <CollectionSection/>
      <Categoriesswiper/>
      <CarterShowcase />
      <DesignYourJacket />
      <TestimonialBanner />
      <Whychooseus/>
      <Manufactureprocess/>
      <Trustedschols/>
      <Community/>
      <OurRecentBlogs/>
      <Testimonials />
      <OurProcess />
      <Collage />
      <OurStory />
      <OnTheGram />
      <Faqs/>
    </>
  );
}
