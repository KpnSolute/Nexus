export default function TradoraSopAccountSetup() {
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

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "7vh 5vw",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ fontSize: "1vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "1.5vh" }}>
          Getting Started
        </div>

        <h1
          style={{
            fontSize: "3.8vw",
            fontWeight: 700,
            color: "#FFFFFF",
            margin: "0 0 1.5vh 0",
            letterSpacing: "-0.02em",
          }}
        >
          Account Setup
        </h1>

        <p
          style={{
            fontSize: "1.2vw",
            color: "#9AA5CE",
            lineHeight: 1.5,
            margin: "0 0 4vh 0",
            fontWeight: 400,
          }}
        >
          Three steps to get your Tradora terminal operational. No KYC required at the platform level.
        </p>

        {/* Step 1 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw", marginBottom: "3vh" }}>
          <div style={{ width: "2.8vw", height: "2.8vw", borderRadius: "50%", backgroundColor: "rgba(122, 162, 247, 0.12)", border: "1px solid rgba(122, 162, 247, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7AA2F7", fontSize: "1.2vw", fontWeight: 700, flexShrink: 0 }}>1</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1.4vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Register an account</div>
            <div style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.5, marginBottom: "1.2vh" }}>
              Visit the terminal and click "Register New Operator." Choose a username (min 3 chars) and password (min 6 chars).
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.2vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'JetBrains Mono', monospace", fontSize: "1vw", color: "#9ECE6A" }}>
              POST /auth/register — 201 Created
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw", marginBottom: "3vh" }}>
          <div style={{ width: "2.8vw", height: "2.8vw", borderRadius: "50%", backgroundColor: "rgba(158, 206, 106, 0.12)", border: "1px solid rgba(158, 206, 106, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ECE6A", fontSize: "1.2vw", fontWeight: 700, flexShrink: 0 }}>2</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1.4vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Connect a broker</div>
            <div style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.5, marginBottom: "1.2vh" }}>
              Navigate to Connected Accounts. Select your exchange (Coinbase, Binance, Kraken, Bybit, or Alpaca) and paste your API key and secret. Tradora validates keys on save.
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.2vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'JetBrains Mono', monospace", fontSize: "1vw", color: "#C0CAF5" }}>
              POST /accounts <span style={{ color: "#565F89" }}>— exchange, apiKey, secret, mode</span>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw" }}>
          <div style={{ width: "2.8vw", height: "2.8vw", borderRadius: "50%", backgroundColor: "rgba(224, 175, 104, 0.12)", border: "1px solid rgba(224, 175, 104, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#E0AF68", fontSize: "1.2vw", fontWeight: 700, flexShrink: 0 }}>3</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1.4vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Choose paper or live mode</div>
            <div style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.5, marginBottom: "1.2vh" }}>
              Paper mode simulates order execution using live Kraken prices — no real funds at risk. Switch to live mode only when you are ready to trade.
            </div>
            <div style={{ display: "flex", gap: "1.5vw" }}>
              <div style={{ backgroundColor: "rgba(158, 206, 106, 0.08)", border: "1px solid rgba(158, 206, 106, 0.25)", borderRadius: "0.4vw", padding: "0.8vh 1.2vw", fontFamily: "'JetBrains Mono', monospace", fontSize: "1vw", color: "#9ECE6A" }}>mode: "paper"</div>
              <div style={{ backgroundColor: "rgba(255, 158, 100, 0.08)", border: "1px solid rgba(255, 158, 100, 0.25)", borderRadius: "0.4vw", padding: "0.8vh 1.2vw", fontFamily: "'JetBrains Mono', monospace", fontSize: "1vw", color: "#FF9E64" }}>mode: "live"</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>02</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Tradora, Inc.</div>
        </div>
      </div>
    </div>
  );
}
