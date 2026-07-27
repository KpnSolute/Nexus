export default function TradoraSopSecurity() {
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
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw",
          height: "60vh",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(122, 162, 247, 0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Full-width centered content */}
      <div
        style={{
          flex: 1,
          padding: "10vh 10vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo mark */}
        <div style={{ width: "4vw", height: "4vw", backgroundColor: "#7AA2F7", borderRadius: "1vw", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "4vh" }}>
          <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#1A1B26", borderRadius: "0.4vw" }} />
        </div>

        <div style={{ fontSize: "1vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "2vh" }}>
          Security
        </div>

        <h1
          style={{
            fontSize: "4.5vw",
            fontWeight: 700,
            color: "#FFFFFF",
            margin: "0 0 2vh 0",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          Security &amp; Risk Management
        </h1>

        <p
          style={{
            fontSize: "1.3vw",
            color: "#9AA5CE",
            lineHeight: 1.6,
            maxWidth: "42vw",
            margin: "0 0 6vh 0",
            textAlign: "center",
          }}
        >
          Tradora never holds your funds. API keys are encrypted at rest. You control every order.
        </p>

        {/* Three best-practice cards */}
        <div style={{ display: "flex", gap: "2vw", width: "100%", maxWidth: "68vw" }}>

          <div style={{ flex: 1, backgroundColor: "rgba(122, 162, 247, 0.05)", border: "1px solid rgba(122, 162, 247, 0.15)", borderRadius: "0.6vw", padding: "3vh 2.5vw" }}>
            <div style={{ fontSize: "1.8vw", fontWeight: 700, color: "#7AA2F7", marginBottom: "1.5vh" }}>01</div>
            <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "1vh" }}>Use paper mode first</div>
            <div style={{ fontSize: "1vw", color: "#9AA5CE", lineHeight: 1.5 }}>
              Run every new strategy in paper mode for at least 48 hours before switching to live. Validate fills and sizes against your expectations.
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: "rgba(158, 206, 106, 0.05)", border: "1px solid rgba(158, 206, 106, 0.15)", borderRadius: "0.6vw", padding: "3vh 2.5vw" }}>
            <div style={{ fontSize: "1.8vw", fontWeight: 700, color: "#9ECE6A", marginBottom: "1.5vh" }}>02</div>
            <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "1vh" }}>Restrict API key scope</div>
            <div style={{ fontSize: "1vw", color: "#9AA5CE", lineHeight: 1.5 }}>
              Grant only trade and read permissions on exchange API keys — never withdrawal access. Tradora requires no withdrawal permission.
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: "rgba(224, 175, 104, 0.05)", border: "1px solid rgba(224, 175, 104, 0.15)", borderRadius: "0.6vw", padding: "3vh 2.5vw" }}>
            <div style={{ fontSize: "1.8vw", fontWeight: 700, color: "#E0AF68", marginBottom: "1.5vh" }}>03</div>
            <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "1vh" }}>Review automation rules</div>
            <div style={{ fontSize: "1vw", color: "#9AA5CE", lineHeight: 1.5 }}>
              Each rule fires once — from active to completed or failed. Audit your active rules regularly and delete stale ones.
            </div>
          </div>

        </div>

        {/* Bottom trust indicators */}
        <div style={{ marginTop: "6vh", display: "flex", gap: "4vw", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "4vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
            <div style={{ width: "0.7vw", height: "0.7vw", backgroundColor: "#9ECE6A", borderRadius: "50%" }} />
            <div style={{ fontSize: "1.1vw", color: "#C0CAF5" }}>Non-custodial</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
            <div style={{ width: "0.7vw", height: "0.7vw", backgroundColor: "#7AA2F7", borderRadius: "50%" }} />
            <div style={{ fontSize: "1.1vw", color: "#C0CAF5" }}>Keys encrypted at rest</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
            <div style={{ width: "0.7vw", height: "0.7vw", backgroundColor: "#E0AF68", borderRadius: "50%" }} />
            <div style={{ fontSize: "1.1vw", color: "#C0CAF5" }}>Paper mode always available</div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "6vh", left: "10vw", right: "10vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>05</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Tradora, Inc.</div>
        </div>
      </div>
    </div>
  );
}
