import React from "react";

const GenerativeCanvas: React.FC = () => {
  const handleClick = () => {
    alert("✅ Button clicked! Ready to mint.");
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        backgroundColor: "#111",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <h1>Arciumint Mint Preview</h1>
      <video
        src="https://arweave.net/KTpZdjb68t3d-TIIvyBR05_cHzmfFjvqcVHUDk6uKDA"
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "100%",
          maxWidth: "600px",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
        }}
      />
      <button
        onClick={handleClick}
        style={{
          marginTop: "1.5rem",
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#fff",
          color: "#111",
          border: "none",
          borderRadius: "8px",
        }}
      >
        Mint Now
      </button>
    </div>
  );
};

export default GenerativeCanvas;
