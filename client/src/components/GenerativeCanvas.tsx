import React from "react";

const GenerativeCanvas: React.FC = () => {
  const handleClick = () => {
    alert("✅ سایت بالا اومد و دکمه کار می‌کنه!");
  };

  return (
    <div style={{ width: "100%", height: "100vh", backgroundColor: "#111", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h1>Arciumint Test Page</h1>
      <p>این فقط یه تست ساده‌ست برای اینکه مطمئن بشیم سایت بالا میاد.</p>
      <button onClick={handleClick} style={{ padding: "12px 24px", fontSize: "16px", cursor: "pointer" }}>
        تست دکمه
      </button>
    </div>
  );
};

export default GenerativeCanvas;
