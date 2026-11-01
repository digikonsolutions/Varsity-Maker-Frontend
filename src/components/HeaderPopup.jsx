import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HeaderPopup.css";

// Ab yahan koi faltu "slug" nahi hai. Bas jo custom url chahiye, direct daal do!
const GALLERY_ITEMS = [
  { 
    id: 1,  
    title: "Letterman Jacket", 
    image: "https://picsum.photos/seed/v1/400/300",  
    url: "/builder/lettermanjacketbuilder" 
  },
  { 
    id: 2,  
    title: "Raglan Varsity Jacket",   
    image: "https://picsum.photos/seed/v2/400/300",  
    url: "/builder/raglanvarsityjacketbuilder" 
  },
  { 
    id: 3,  
    title: "Bomber Varsity Jacket",       
    image: "https://picsum.photos/seed/v3/400/300",  
    url: "/builder/bombervarsityjacketbuilder" 
  },
  { 
    id: 4,  
    title: "Hooded Varsity Jacket",         
    image: "https://picsum.photos/seed/v4/400/300",  
    url: "/builder/hoodedvarsityjacketbuilder" 
  },
  { 
    id: 5,  
    title: "Cropped Varsity Jacket",     
    image: "https://picsum.photos/seed/v5/400/300",  
    url: "/builder/croppedvarsityjacketbuilder" 
  },
  { 
    id: 6,  
    title: "Leather varsity Jacket",    
    image: "https://picsum.photos/seed/v6/400/300",  
    url: "/builder/leatherjacketbuilder" 
  },
  { 
    id: 7,  
    title: "Overlap Standup Collar Varsity Jacket",   
    image: "https://picsum.photos/seed/v7/400/300",  
    url: "/builder/overlapstandupcollarvarsityjacketbuilder" 
  },
  { 
    id: 8,  
    title: "Retro Varsity Jacket",     
    image: "https://picsum.photos/seed/v8/400/300",  
    url: "/builder/retrovarsityjacketbuilder" 
  },
  { 
    id: 9,  
    title: "Sailor Varsity Jacket",     
    image: "./sailor-varsity-jacket.png",  
    url: "/builder/sailorvarsityjacketbuilder" 
  },
  { 
    id: 10, 
    title: "Zipper Hooded Varsity Jacket",     
    image: "https://picsum.photos/seed/v10/400/300", 
    url: "/builder/zipperhoodedvarsityjacket" 
  },
];

export default function DesignStudioModal({ open, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleNavigation = (item) => {
    onClose();

    if (item.url) {
      if (item.url.startsWith("http://") || item.url.startsWith("https://")) {
        window.open(item.url, "_blank", "noopener,noreferrer");
      } else {
        navigate(item.url);
      }
    }
  };

  return (
    <div className="ds-overlay" onClick={onClose}>
      <div className="ds-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="ds-header">
          <div>
            <h2 className="ds-title">Choose Your Jacket Style</h2>
            <p className="ds-subtitle">Choose your favorite base and customize it your way.</p>
          </div>
          <button className="ds-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="ds-grid">
          {GALLERY_ITEMS.map((item) => (
            <div className="ds-card" key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
             
              
              {/* Force rendering details explicitly just in case your CSS is messing up layout */}
              <div className="ds-card-body" style={{ padding: '10px 0', textAlign: 'center', width: '100%' }}>
                <div className="ds-card-title" style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333', fontSize:'13px'}}>
                  {item.title}
                </div>
                <button 
                  className="ds-card-btn" 
                  onClick={() => handleNavigation(item)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#111',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Customize
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}