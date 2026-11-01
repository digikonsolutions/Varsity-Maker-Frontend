const baseurl = "https://admin.varsitymaker.co/api";
const storageurl = "https://admin.varsitymaker.co/storage/";
const main_url = "https://admin.varsitymaker.co";
const aiautomationsbaseurl = 'http://127.0.0.1:9000/';

// products url
const getallproducts = '/products';
const getproductsbyslug = '/collections/products';

// chat bot url
const chat = 'chat'

// collections url
const collections = "/collections";

// reviews urls
const reviews = "/reviews";
const replyreview = "/replies";


// blogs urls
const getallblogcategories = '/categories';
const getallblogsbycategoryID = '/blogs/category/';
const getsingleblogbyid = '/blog';
const getlatestblogs = '/blogs'

// subscribe urls
const subscribeourcommunity = '/subscribe';

// contact us urls
const contactmessages = '/contact';


// auth urls
const register = '/register';
const login = '/login';

// order urls
const orders = '/orders';
const myorders = '/my-orders';

// tracking orders url
const trackorders = '/track'


// affilites routes
const referral = '/ref';
const createaffiliate = '/affiliate/create';
const affiliatedashboard = '/affiliate/dashboard';

// patches urls
const patches = '/batches';

// colors and materials urls
const colorsandmaterials = '/colorsandmaterials';

// school registration
const schoolregistration = '/school-registration'


export {baseurl,main_url,  getallproducts, storageurl, aiautomationsbaseurl,chat, collections, getproductsbyslug, reviews, replyreview,
getallblogcategories, subscribeourcommunity, getallblogsbycategoryID, getsingleblogbyid, getlatestblogs, contactmessages,
register, login, orders, myorders, trackorders, referral, createaffiliate, affiliatedashboard, patches, colorsandmaterials, schoolregistration };