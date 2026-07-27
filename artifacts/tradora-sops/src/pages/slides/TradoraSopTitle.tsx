const base = import.meta.env.BASE_URL;

export default function TradoraSopTitle() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#1A1B26",
        fontFamily: "'Space Grotesk', sans-serif",
        display: "flex",
        color: "#C0CAF5",
        position: "relative",
      }}
    >
      {/* Left Sidebar */}
      <div
        style={{
          width: "22vw",
          height: "100vh",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "5vh 3vw",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          backgroundColor: "#16161E",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "6vh" }}>
          <div style={{ width: "1.6vw", height: "1.6vw", backgroundColor: "#7AA2F7", borderRadius: "0.3vw", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "0.7vw", height: "0.7vw", backgroundColor: "#1A1B26", borderRadius: "0.15vw" }} />
          </div>
          <div style={{ fontSize: "1.2vw", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.1em" }}>TRADORA</div>
        </div>

        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1.5vh" }}>
          Getting Started
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", marginBottom: "4vh" }}>
          <div style={{ fontSize: "1vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.8vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px" }} />
            Account Setup
          </div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.55, paddingLeft: "calc(3px + 0.8vw)" }}>Broker Connections</div>
        </div>

        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1.5vh" }}>
          Operations
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", marginBottom: "4vh" }}>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.55, paddingLeft: "calc(3px + 0.8vw)" }}>Placing Trades</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.55, paddingLeft: "calc(3px + 0.8vw)" }}>Automation Rules</div>
        </div>

        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1.5vh" }}>
          Security
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.55, paddingLeft: "calc(3px + 0.8vw)" }}>Risk Management</div>
        </div>

        <div style={{ marginTop: "auto", fontSize: "0.85vw", color: "#565F89" }}>
          v1.0 — July 2026
        </div>
      </div>

      {/* Main Content — hero image background */}
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Hero image */}
        <img
          src={`${base}hero-title.jpg`}
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.25,
          }}
          alt=""
        />
        {/* Overlay gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(26,27,38,0.85) 0%, rgba(26,27,38,0.4) 100%)",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ fontSize: "1vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "2vh" }}>
            SOP Reference
          </div>

          <h1
            style={{
              fontSize: "4.5vw",
              fontWeight: 700,
              color: "#FFFFFF",
              margin: "0 0 2vh 0",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Standard<br />Operating<br />Procedures
          </h1>

          <p
            style={{
              fontSize: "1.3vw",
              color: "#9AA5CE",
              lineHeight: 1.6,
              maxWidth: "34vw",
              margin: "0 0 5vh 0",
              fontWeight: 400,
            }}
          >
            Account setup, broker connections, live trading, automation rules, and security practices — everything you need to operate Tradora.
          </p>

          {/* Endpoint badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "1.5vh 2vw",
              backgroundColor: "rgba(158, 206, 106, 0.08)",
              border: "1px solid rgba(158, 206, 106, 0.2)",
              borderRadius: "0.4vw",
              marginBottom: "5vh",
              width: "fit-content",
            }}
          >
            <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#9ECE6A", marginRight: "1.5vw", fontFamily: "'JetBrains Mono', monospace" }}>
              GET
            </div>
            <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace" }}>
              /tradora/v1/sops
            </div>
          </div>

          {/* Two stat columns */}
          <div style={{ display: "flex", gap: "4vw" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5vh" }}>
              <div style={{ fontSize: "2.8vw", fontWeight: 700, color: "#7AA2F7" }}>5</div>
              <div style={{ fontSize: "1vw", color: "#565F89", textTransform: "uppercase", letterSpacing: "0.08em" }}>Core Procedures</div>
            </div>
            <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5vh" }}>
              <div style={{ fontSize: "2.8vw", fontWeight: 700, color: "#9ECE6A" }}>5</div>
              <div style={{ fontSize: "1vw", color: "#565F89", textTransform: "uppercase", letterSpacing: "0.08em" }}>Broker Integrations</div>
            </div>
            <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5vh" }}>
              <div style={{ fontSize: "2.8vw", fontWeight: 700, color: "#E0AF68" }}>24/7</div>
              <div style={{ fontSize: "1vw", color: "#565F89", textTransform: "uppercase", letterSpacing: "0.08em" }}>Live Monitoring</div>
            </div>
          </div>

          <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
            <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Tradora, Inc.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
