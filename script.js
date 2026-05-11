const { useState, useRef, useCallback } = React;

const initialCategories = [
  { id: 1, name: "الأرضيات", icon: "▦", images: [], options: [] },
  { id: 2, name: "الدهانات", icon: "🎨", images: [], options: [] },
  { id: 3, name: "المطبخ", icon: "🍳", images: [], options: [] },
  { id: 4, name: "الحمام", icon: "🚿", images: [], options: [] },
];

const STATUS = {
  none: { color: "#555" },
  yes: { color: "#4ade80" },
  maybe: { color: "#fbbf24" },
  no: { color: "#f87171" },
};

function ImageGallery({ images, onAdd, onDelete, currentImages = [], context = "option" }) {
  const fileRef = useRef();
  const [lightbox, setLightbox] = useState(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => onAdd({ id: Date.now() + Math.random(), src: e.target.result, name: file.name });
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }, []); 

  const galleryImages = context === "category_add" ? currentImages : images;

  return (
    <div style={{ marginTop: context === "category_main" ? "0" : "10px" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        {galleryImages.map((img, idx) => (
          <div key={img.id} style={{ position: "relative", width: context === "category_main" ? "48px" : "74px", height: context === "category_main" ? "48px" : "74px", borderRadius: "8px", overflow: "hidden", cursor: "zoom-in", flexShrink: 0, border: "1px solid #2a2a2a" }} onClick={() => setLightbox(idx)}>
            <img src={img.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <button onClick={(e) => { e.stopPropagation(); onDelete(img.id); }} style={{ position: "absolute", top: "3px", left: "3px", width: "18px", height: "18px", borderRadius: "50%", background: "rgba(0,0,0,0.8)", border: "none", color: "#ddd", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, fontFamily: "inherit" }}>×</button>
          </div>
        ))}

        {/* زر إضافة الصورة متاح الآن في كل الأماكن */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileRef.current.click()}
          style={{ width: context === "category_main" ? "48px" : "74px", height: context === "category_main" ? "48px" : "74px", borderRadius: "8px", border: `1.5px dashed ${dragging ? "#f5c87a" : "#333"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, background: dragging ? "#2a2410" : "transparent", transition: "all 0.2s", color: dragging ? "#f5c87a" : "#444" }}
        >
          <span style={{ fontSize: context === "category_main" ? "18px" : "22px", lineHeight: 1 }}>+</span>
          {context !== "category_main" && <span style={{ fontSize: "10px", marginTop: "3px" }}>صورة</span>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => processFiles(e.target.files)} />
      </div>

      {lightbox !== null && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={galleryImages[lightbox]?.src} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "88vw", maxHeight: "88vh", borderRadius: "10px", objectFit: "contain", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} />
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: "18px", left: "18px", background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", fontSize: "20px", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer" }}>×</button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [categories, setCategories] = useState(initialCategories);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📦");
  const [newCatImages, setNewCatImages] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const [newOption, setNewOption] = useState({ name: "", price: "", note: "" });
  const [addingCat, setAddingCat] = useState(false);
  const [expandedOpts, setExpandedOpts] = useState({});

  const activeCategory = categories.find((c) => c.id === activeTab);
  const toggleExpand = (id) => setExpandedOpts(p => ({ ...p, [id]: !p[id] }));

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const id = Date.now();
    setCategories([...categories, { id, name: newCatName.trim(), icon: newCatIcon, images: newCatImages, options: [] }]);
    setNewCatName(""); setNewCatIcon("📦"); setNewCatImages([]);
    setActiveTab(id); setAddingCat(false);
  };

  const deleteCategory = (id) => {
    const remaining = categories.filter((c) => c.id !== id);
    setCategories(remaining);
    if (activeTab === id && remaining.length > 0) setActiveTab(remaining[0].id);
  };

  const addOption = () => {
    if (!newOption.name.trim()) return;
    const newId = Date.now();
    setCategories(categories.map((c) =>
      c.id === activeTab ? { ...c, options: [...c.options, { id: newId, ...newOption, status: "none", images: [] }] } : c
    ));
    setNewOption({ name: "", price: "", note: "" });
  };

  const deleteOption = (optId) => {
    setCategories(categories.map((c) =>
      c.id === activeTab ? { ...c, options: c.options.filter((o) => o.id !== optId) } : c
    ));
  };

  const addImage = (optId, img) => {
    setCategories(categories.map((c) =>
      c.id === activeTab ? { ...c, options: c.options.map((o) => o.id === optId ? { ...o, images: [...(o.images || []), img] } : o) } : c
    ));
  };

  const deleteImage = (optId, imgId) => {
    setCategories(categories.map((c) =>
      c.id === activeTab ? { ...c, options: c.options.map((o) => o.id === optId ? { ...o, images: (o.images || []).filter(i => i.id !== imgId) } : o) } : c
    ));
  };

  const addCategoryImage = (img) => {
    setCategories(categories.map((c) =>
      c.id === activeTab ? { ...c, images: [...(c.images || []), img] } : c
    ));
  };

  const deleteCategoryImage = (imgId) => {
    setCategories(categories.map((c) =>
      c.id === activeTab ? { ...c, images: (c.images || []).filter(i => i.id !== imgId) } : c
    ));
  };

  const addNewCatTempImage = (img) => setNewCatImages([...newCatImages, img]);
  const deleteNewCatTempImage = (imgId) => setNewCatImages(newCatImages.filter(i => i.id !== imgId));

  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <div style={{ background: "#161616", borderBottom: "1px solid #252525", padding: "18px 28px" }}>
        <div style={{ fontSize: "21px", fontWeight: 900, color: "#f5f0e8" }}>🏗️ خيارات التشطيب</div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ width: "210px", background: "#141414", borderLeft: "1px solid #1e1e1e", padding: "14px 10px", overflowY: "auto" }}>
          {categories.map((cat) => (
            <div key={cat.id} style={{ position: "relative", marginBottom: "3px" }}>
              <button className="tab-btn" onClick={() => setActiveTab(cat.id)} style={{
                width: "100%", textAlign: "right", padding: "9px 10px", borderRadius: "8px",
                background: activeTab === cat.id ? "#231f18" : "transparent",
                color: activeTab === cat.id ? "#f5c87a" : "#666",
                borderRight: activeTab === cat.id ? "3px solid #f5c87a" : "3px solid transparent",
                display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontFamily: "inherit"
              }}>
                <span>{cat.icon}</span>
                <span style={{ flex: 1 }}>{cat.name}</span>
              </button>
            </div>
          ))}

          {addingCat ? (
            <div style={{ marginTop: "10px", background: "#1a1a1a", borderRadius: "8px", padding: "10px" }}>
              <div style={{display: "flex", gap: "6px", marginBottom: "6px"}}>
                <input value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} placeholder="🏠" style={{ width: "36px", background: "#222", border: "1px solid #2e2e2e", borderRadius: "6px", color: "#e8e0d5", textAlign: "center", padding: "5px" }} />
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCategory()} placeholder="اسم البند..." style={{ flex: 1, background: "#222", border: "1px solid #2e2e2e", borderRadius: "6px", color: "#e8e0d5", padding: "7px" }} />
              </div>
              
              {/* جزء إضافة الصور للبند الجديد */}
              <div style={{marginBottom: "10px"}}>
                <div style={{fontSize: "11px", color: "#666", marginBottom: "4px"}}>صور البند:</div>
                <ImageGallery images={[]} onAdd={addNewCatTempImage} onDelete={deleteNewCatTempImage} currentImages={newCatImages} context="category_add" />
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={addCategory} style={{ flex: 1, background: "#f5c87a", color: "#1a1400", padding: "6px", borderRadius: "6px", border: "none", cursor: "pointer" }}>إضافة</button>
                <button onClick={() => setAddingCat(false)} style={{ flex: 1, background: "#252525", color: "#777", padding: "6px", borderRadius: "6px", border: "none", cursor: "pointer" }}>إلغاء</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingCat(true)} style={{ width: "100%", marginTop: "10px", padding: "8px", background: "transparent", border: "1px dashed #272727", borderRadius: "8px", color: "#484848", cursor: "pointer" }}>+ بند جديد</button>
          )}
        </div>

        <div style={{ flex: 1, padding: "24px 26px", overflowY: "auto" }}>
          {activeCategory && (
            <>
              {/* عنوان البند الرئيسي مع إمكانية إضافة الصور المباشرة له */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <span style={{ fontSize: "24px" }}>{activeCategory.icon}</span>
                <h2 style={{ fontSize: "19px", color: "#f0e8d8", flex: 1 }}>{activeCategory.name}</h2>
                <ImageGallery images={activeCategory.images || []} onAdd={addCategoryImage} onDelete={deleteCategoryImage} context="category_main" />
              </div>

              <div style={{ background: "#141414", border: "1px solid #222", borderRadius: "12px", padding: "15px", marginBottom: "20px", display: "flex", gap: "8px" }}>
                <input value={newOption.name} onChange={e => setNewOption({ ...newOption, name: e.target.value })} placeholder="الاسم" style={{ flex: "2", background: "#1a1a1a", border: "1px solid #282828", borderRadius: "8px", color: "#e8e0d5", padding: "8px" }} />
                <input value={newOption.price} onChange={e => setNewOption({ ...newOption, price: e.target.value })} placeholder="السعر" style={{ flex: "1", background: "#1a1a1a", border: "1px solid #282828", borderRadius: "8px", color: "#e8e0d5", padding: "8px" }} />
                <button onClick={addOption} style={{ background: "#f5c87a", color: "#1a1400", border: "none", borderRadius: "8px", padding: "8px 18px", cursor: "pointer", fontWeight: "bold" }}>أضف</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {activeCategory.options.map((opt) => {
                  const isOpen = !!expandedOpts[opt.id];
                  return (
                    <div key={opt.id} className="option-card" style={{ background: "#141414", border: "1px solid #202020", borderRadius: "11px" }}>
                      <div style={{ padding: "13px 15px", display: "flex", alignItems: "center", gap: "11px" }}>
                        <div style={{ flex: 1, color: "#f0e8d8" }}>{opt.name}</div>
                        <button className="img-toggle" onClick={() => toggleExpand(opt.id)} style={{ background: "transparent", border: "1px solid #333", borderRadius: "7px", padding: "5px 9px", color: "#888", cursor: "pointer" }}>🖼 صور</button>
                        <button className="del-opt" onClick={() => deleteOption(opt.id)} style={{ color: "#3a3a3a", background: "none", border: "none", fontSize: "17px", cursor: "pointer" }}>×</button>
                      </div>
                      {isOpen && (
                        <div style={{ padding: "0 15px 14px" }}>
                          <ImageGallery images={opt.images || []} onAdd={(img) => addImage(opt.id, img)} onDelete={(imgId) => deleteImage(opt.id, imgId)} context="option" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
