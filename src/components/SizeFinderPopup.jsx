import { useState, useMemo, useEffect, useCallback } from "react";
import { Ruler, X, ArrowRight, RotateCcw, Check } from "lucide-react";

/* ===========================================================================
   Size logic (mirrors your Laravel controller so the demo works standalone).
   To use the real API, replace computeSizes() with a fetch to
   POST /api/size-recommendation — see the note at the bottom.
=========================================================================== */

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

const FITS = {
  slim: "Slim fit",
  regular: "Regular fit",
  athletic: "Tailored / athletic fit",
  heavy: "Comfort / relaxed fit",
};

function heightIndex(cm) {
  if (cm < 160) return 0; if (cm < 167) return 1; if (cm < 173) return 2;
  if (cm < 179) return 3; if (cm < 185) return 4; if (cm < 192) return 5; return 6;
}
function weightIndex(kg) {
  if (kg < 52) return 0; if (kg < 60) return 1; if (kg < 70) return 2;
  if (kg < 80) return 3; if (kg < 90) return 4; if (kg < 102) return 5; return 6;
}

function computeSizes({ gender, heightCm, weightKg, bodyType }) {
  const hi = heightIndex(heightCm);
  const wi = weightIndex(weightKg);
  let base = Math.round(wi * 0.6 + hi * 0.4);
  if (bodyType === "heavy") base += 1;
  if (bodyType === "slim" && base >= 2) base -= 1;
  base = clamp(base, 0, 6);
  const jacket = clamp(base + 1, 0, 6);
  let waist = 26 + wi * 2;
  if (bodyType === "heavy") waist += 2;
  if (bodyType === "slim") waist -= 1;
  if (gender === "female") waist = Math.max(24, waist - 2);
  waist = clamp(waist, 24, 44);
  const length = Math.round((heightCm / 2.54) * 0.58);
  return {
    baseIndex: base,
    shirt: SIZES[base], tshirt: SIZES[base],  jacket: SIZES[jacket],
    waist, length, fit: FITS[bodyType] || FITS.regular, gender,
  };
}


function Segmented({ value, onChange, options, name }) {
  return (
    <div className="sf-seg" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={"sf-seg-btn" + (value === o.value ? " is-on" : "")}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Scale({ index }) {
  return (
    <div className="sf-scale" aria-hidden="true">
      <span className="sf-scale-rail" />
      {SIZES.map((s, i) => (
        <span key={s} className={"sf-scale-node" + (i === index ? " is-on" : "")}>{s}</span>
      ))}
    </div>
  );
}

function Spec({ label, value, sub }) {
  return (
    <div className="sf-spec">
      <span className="sf-spec-label">{label}</span>
      <span className="sf-spec-dots" />
      <span className="sf-spec-value">{value}{sub && <em className="sf-spec-sub">{sub}</em>}</span>
    </div>
  );
}

/* ===========================================================================
   The modal — drop this on your product page.
   <SizeFinderModal open={open} onClose={() => setOpen(false)} />
=========================================================================== */

export function SizeFinderModal({ open, onClose }) {
  const [gender, setGender] = useState("male");
  const [unit, setUnit] = useState("cm");
  const [heightCm, setHeightCm] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [bodyType, setBodyType] = useState("regular");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const resolvedHeight = useMemo(() => {
    if (unit === "cm") return parseFloat(heightCm);
    const f = parseFloat(feet) || 0, i = parseFloat(inches) || 0;
    if (!f && !i) return NaN;
    return Math.round((f * 12 + i) * 2.54);
  }, [unit, heightCm, feet, inches]);

  // Esc to close + lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const submit = useCallback(() => {
    const h = resolvedHeight, w = parseFloat(weight);
    if (!h || h < 120 || h > 230) return setError("Enter a height between 120 and 230 cm.");
    if (!w || w < 30 || w > 200) return setError("Enter a weight between 30 and 200 kg.");
    setError("");
    setResult(computeSizes({ gender, heightCm: h, weightKg: w, bodyType }));
  }, [resolvedHeight, weight, gender, bodyType]);

  if (!open) return null;

  return (
    <div className="sf-overlay" onClick={onClose} role="presentation">
      <style>{css}</style>
      <div
        className="sf-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Size finder"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sf-modal-inner">
          <button className="sf-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>

          <div className="sf-head">
            <span className="sf-kicker"><Ruler size={13} /> Size finder</span>
            <h2 className="sf-title">{result ? "Your fit" : "Find your size"}</h2>
            {!result && <p className="sf-sub">Three quick numbers and we'll recommend your size.</p>}
          </div>

          {!result ? (
            <div className="sf-body">
              <div className="sf-field">
                <label className="sf-lbl">Gender</label>
                <Segmented name="Gender" value={gender} onChange={setGender}
                  options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} />
              </div>

              <div className="sf-field">
                <div className="sf-lbl-row">
                  <label className="sf-lbl">Height</label>
                  <Segmented name="Unit" value={unit} onChange={setUnit}
                    options={[{ value: "cm", label: "cm" }, { value: "ft", label: "ft / in" }]} />
                </div>
                {unit === "cm" ? (
                  <div className="sf-input-wrap">
                    <input className="sf-input" type="number" inputMode="numeric" placeholder="175"
                      value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
                    <span className="sf-unit">cm</span>
                  </div>
                ) : (
                  <div className="sf-split">
                    <div className="sf-input-wrap">
                      <input className="sf-input" type="number" placeholder="5" value={feet} onChange={(e) => setFeet(e.target.value)} />
                      <span className="sf-unit">ft</span>
                    </div>
                    <div className="sf-input-wrap">
                      <input className="sf-input" type="number" placeholder="9" value={inches} onChange={(e) => setInches(e.target.value)} />
                      <span className="sf-unit">in</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="sf-row2">
                <div className="sf-field">
                  <label className="sf-lbl">Weight</label>
                  <div className="sf-input-wrap">
                    <input className="sf-input" type="number" inputMode="numeric" placeholder="72" value={weight} onChange={(e) => setWeight(e.target.value)} />
                    <span className="sf-unit">kg</span>
                  </div>
                </div>
                <div className="sf-field">
                  <label className="sf-lbl">Age <em className="sf-opt">optional</em></label>
                  <div className="sf-input-wrap">
                    <input className="sf-input" type="number" inputMode="numeric" placeholder="28" value={age} onChange={(e) => setAge(e.target.value)} />
                    <span className="sf-unit">yrs</span>
                  </div>
                </div>
              </div>

              <div className="sf-field">
                <label className="sf-lbl">Body type <em className="sf-opt">optional</em></label>
                <div className="sf-chips">
                  {[
                    { value: "slim", label: "Slim" },
                    { value: "regular", label: "Regular" },
                    { value: "athletic", label: "Athletic" },
                    { value: "heavy", label: "Heavy" },
                  ].map((b) => (
                    <button key={b.value} type="button"
                      className={"sf-chip" + (bodyType === b.value ? " is-on" : "")}
                      onClick={() => setBodyType(b.value)}>{b.label}</button>
                  ))}
                </div>
              </div>

              {error && <p className="sf-error">{error}</p>}

              <button className="sf-cta" type="button" onClick={submit}>
                Get my size <ArrowRight size={17} strokeWidth={2.4} />
              </button>
            </div>
          ) : (
            <div className="sf-result">
              <div className="sf-result-hero">
                <span className="sf-result-letter">{result.shirt}</span>
                <span className="sf-fit-badge"><Check size={13} strokeWidth={3} /> {result.fit}</span>
              </div>

              <Scale index={result.baseIndex} />

              <div className="sf-specs">
                <Spec label="Shirt" value={result.shirt} />
                <Spec label="T-Shirt" value={result.tshirt} />
                
                <Spec label="Jacket" value={result.jacket} sub="layering" />
                <Spec label="Trouser waist" value={result.waist} sub="in" />
                <Spec label="Trouser length" value={result.length} sub="in" />
              </div>

              <p className="sf-disclaimer">
                A guide based on your height and weight. Always confirm against the product's own size chart.
              </p>

              <div className="sf-result-actions">
                <button className="sf-ghost" type="button" onClick={() => setResult(null)}>
                  <RotateCcw size={14} /> Recalculate
                </button>
                <button className="sf-cta sf-cta-slim" type="button" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   Demo product page + trigger button (this is the default export).
   On your real PDP: keep your own button, add `open` state, and render
   <SizeFinderModal open={open} onClose={() => setOpen(false)} />.
=========================================================================== */

// export default function SizeFinderDemo() {
//   const [open, setOpen] = useState(false);
//   return (
//     <div className="sf-demo">
//       <style>{css}</style>
//       <div className="sf-demo-card">
//         <div className="sf-demo-media">VLEONS</div>
//         <div className="sf-demo-info">
//           <span className="sf-demo-brand">VLEONS · Menswear</span>
//           <h1 className="sf-demo-name">Tailored Linen Shirt</h1>
//           <p className="sf-demo-price">PKR 8,900</p>
//           <div className="sf-demo-sizes">
//             {["S", "M", "L", "XL"].map((s) => <span key={s} className="sf-demo-size">{s}</span>)}
//           </div>
//           <button className="sf-trigger" type="button" onClick={() => setOpen(true)}>
//             <Ruler size={16} /> Find my size
//           </button>
//           <button className="sf-buy" type="button">Add to cart</button>
//         </div>
//       </div>

//       <SizeFinderModal open={open} onClose={() => setOpen(false)} />
//     </div>
//   );
// }

export default SizeFinderModal;

/* ===========================================================================
   Styles — gold / navy / white. Fonts: Gonia (display) + Montserrat (body).
   Drop your Gonia font file in and uncomment the @font-face block below.
=========================================================================== */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

/*
@font-face {
  font-family: 'Gonia';
  src: url('/fonts/Gonia.woff2') format('woff2');
  font-weight: 400 700;
  font-display: swap;
}
*/

.sf-demo, .sf-overlay {
  --gold:#caa35a;
  --gold-soft:rgba(202,163,90,.16);
  --white:#ffffff;
  --blue:#0f172a;
  --blue-2:#16213b;
  --blue-3:#1d2949;
  --line:rgba(255,255,255,.12);
  --muted:rgba(255,255,255,.58);
  --font-display:'Gonia','Montserrat',system-ui,sans-serif;
  --font-body:'Montserrat',system-ui,sans-serif;
}
.sf-demo *, .sf-overlay *{box-sizing:border-box}

/* ---------- demo product page ---------- */
.sf-demo{font-family:var(--font-body);background:#f4f2ee;min-height:100%;display:flex;align-items:center;justify-content:center;padding:clamp(16px,4vw,48px)}
.sf-demo-card{background:var(--white);border-radius:22px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;max-width:760px;width:100%;box-shadow:0 30px 80px -30px rgba(15,23,42,.35)}
@media(max-width:640px){.sf-demo-card{grid-template-columns:1fr}}
.sf-demo-media{background:linear-gradient(150deg,var(--blue),var(--blue-3));color:var(--gold);font-family:var(--font-display);font-size:34px;letter-spacing:.24em;display:flex;align-items:center;justify-content:center;min-height:280px}
.sf-demo-info{padding:clamp(22px,3vw,34px);display:flex;flex-direction:column}
.sf-demo-brand{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);font-weight:600}
.sf-demo-name{font-family:var(--font-display);font-size:26px;line-height:1.15;color:var(--blue);margin:10px 0 6px;font-weight:700}
.sf-demo-price{font-size:18px;color:var(--blue);font-weight:600;margin:0 0 18px}
.sf-demo-sizes{display:flex;gap:8px;margin-bottom:22px}
.sf-demo-size{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(15,23,42,.18);border-radius:10px;font-size:13px;font-weight:600;color:var(--blue)}
.sf-trigger{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:var(--font-body);font-size:14px;font-weight:600;color:var(--blue);background:transparent;border:1.5px solid var(--gold);border-radius:12px;padding:12px;cursor:pointer;transition:.2s;margin-bottom:10px}
.sf-trigger:hover{background:var(--gold-soft)}
.sf-buy{font-family:var(--font-body);font-size:15px;font-weight:600;color:var(--white);background:var(--blue);border:0;border-radius:12px;padding:14px;cursor:pointer;transition:.2s}
.sf-buy:hover{opacity:.9}

/* ---------- overlay + modal ---------- */
.sf-overlay{position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:clamp(12px,4vw,32px);font-family:var(--font-body);animation:sf-fade .25s ease both}
@keyframes sf-fade{from{opacity:0}to{opacity:1}}
.sf-modal{width:clamp(320px,94vw,540px);max-height:92vh;overflow:auto;background:var(--blue);border:1px solid var(--line);border-radius:22px;box-shadow:0 40px 100px -20px rgba(0,0,0,.6);animation:sf-rise .35s cubic-bezier(.2,.7,.2,1) both}
.sf-modal::-webkit-scrollbar{width:8px}
.sf-modal::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:8px}
@keyframes sf-rise{from{opacity:0;transform:translateY(18px) scale(.98)}to{opacity:1;transform:none}}
.sf-modal-inner{position:relative;padding:clamp(24px,4vw,34px)}

.sf-close{position:absolute;top:18px;right:18px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:1px solid var(--line);background:transparent;color:var(--white);cursor:pointer;transition:.2s}
.sf-close:hover{border-color:var(--gold);color:var(--gold)}

.sf-head{margin-bottom:24px;padding-right:40px}
.sf-kicker{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:12px}
.sf-title{font-family:var(--font-display);font-size:30px;line-height:1.05;color:var(--white);margin:0;font-weight:700}
.sf-sub{color:var(--muted);font-size:14px;margin:8px 0 0;line-height:1.5}

.sf-field{margin-bottom:18px}
.sf-lbl{display:block;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--white);margin-bottom:10px}
.sf-opt{font-style:normal;color:var(--muted);font-weight:400;font-size:11px;letter-spacing:0;text-transform:none}
.sf-lbl-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.sf-lbl-row .sf-lbl{margin-bottom:0}

.sf-seg{display:inline-flex;background:var(--blue-2);border:1px solid var(--line);border-radius:999px;padding:3px}
.sf-seg-btn{border:0;background:transparent;font-family:var(--font-body);font-size:13px;font-weight:600;padding:7px 16px;border-radius:999px;cursor:pointer;color:var(--muted);transition:.2s}
.sf-seg-btn.is-on{background:var(--gold);color:var(--blue)}

.sf-input-wrap{position:relative;display:flex;align-items:center}
.sf-input{width:100%;font-family:var(--font-body);font-size:18px;font-weight:600;background:var(--blue-2);border:1px solid var(--line);border-radius:12px;padding:14px 46px 14px 15px;color:var(--white);outline:none;transition:.2s}
.sf-input::placeholder{color:rgba(255,255,255,.32);font-weight:400}
.sf-input:focus{border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-soft)}
.sf-input::-webkit-outer-spin-button,.sf-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.sf-input[type=number]{-moz-appearance:textfield}
.sf-unit{position:absolute;right:15px;font-size:12px;color:var(--muted);pointer-events:none;font-weight:500}
.sf-split{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.sf-row2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px}

.sf-chips{display:flex;flex-wrap:wrap;gap:8px}
.sf-chip{font-family:var(--font-body);font-size:13px;font-weight:600;padding:9px 15px;border-radius:10px;cursor:pointer;background:var(--blue-2);border:1px solid var(--line);color:var(--muted);transition:.18s}
.sf-chip.is-on{background:var(--gold);border-color:var(--gold);color:var(--blue)}
.sf-chip:hover:not(.is-on){border-color:var(--gold);color:var(--white)}

.sf-error{color:#f0a58c;font-size:13px;font-weight:600;margin:14px 0 0}

.sf-cta{width:100%;margin-top:22px;display:flex;align-items:center;justify-content:center;gap:9px;font-family:var(--font-body);font-size:15px;font-weight:700;padding:15px;border-radius:12px;cursor:pointer;background:var(--gold);color:var(--blue);border:0;transition:.2s;letter-spacing:.01em}
.sf-cta:hover{filter:brightness(1.06)}
.sf-cta-slim{margin-top:0;flex:1}

/* ---------- result ---------- */
.sf-result{animation:sf-rise .35s cubic-bezier(.2,.7,.2,1) both}
.sf-result-hero{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:26px}
.sf-result-letter{font-family:var(--font-display);font-size:84px;line-height:.8;font-weight:700;color:var(--gold)}
.sf-fit-badge{display:inline-flex;align-items:center;gap:6px;background:var(--gold-soft);color:var(--gold);font-size:13px;font-weight:600;padding:7px 14px;border-radius:999px;border:1px solid rgba(202,163,90,.3)}

.sf-scale{position:relative;display:flex;justify-content:space-between;align-items:center;margin:0 4px 28px}
.sf-scale-rail{position:absolute;left:0;right:0;top:50%;height:1px;background:var(--line)}
.sf-scale-node{position:relative;z-index:1;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--blue-2);border:1px solid var(--line);font-size:12px;font-weight:600;color:var(--muted);transition:.2s}
.sf-scale-node.is-on{background:var(--gold);border-color:var(--gold);color:var(--blue);transform:scale(1.18);box-shadow:0 0 0 4px var(--gold-soft)}

.sf-specs{border-top:1px solid var(--line);margin-bottom:4px}
.sf-spec{display:flex;align-items:baseline;gap:8px;padding:13px 0;border-bottom:1px solid var(--line)}
.sf-spec-label{font-size:14px;color:var(--muted);white-space:nowrap}
.sf-spec-dots{flex:1;border-bottom:1px dotted rgba(255,255,255,.2);transform:translateY(-4px)}
.sf-spec-value{font-size:20px;font-weight:700;color:var(--white)}
.sf-spec-sub{font-style:normal;font-size:11px;color:var(--muted);margin-left:5px;font-weight:500}

.sf-disclaimer{margin:18px 0 22px;font-size:12px;line-height:1.5;color:var(--muted)}
.sf-result-actions{display:flex;gap:12px}
.sf-ghost{display:inline-flex;align-items:center;justify-content:center;gap:7px;background:transparent;color:var(--white);border:1px solid var(--line);border-radius:12px;padding:14px 18px;font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;transition:.2s}
.sf-ghost:hover{border-color:var(--gold);color:var(--gold)}

@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;
