export default function TradoraSopAutomations() {
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
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.55, paddingLeft: "calc(3px + 0.8vw)" }}>Account Setup</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.55, paddingLeft: "calc(3px + 0.8vw)" }}>Broker Connections</div>
        </div>

        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1.5vh" }}>
          Operations
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", marginBottom: "4vh" }}>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.55, paddingLeft: "calc(3px + 0.8vw)" }}>Placing Trades</div>
          <div style={{ fontSize: "1vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.8vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px" }} />
            Automation Rules
          </div>
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
          Operations
        </div>

        <h1
          style={{
            fontSize: "3.8vw",
            fontWeight: 700,
            color: "#FFFFFF",
            margin: "0 0 1.2vh 0",
            letterSpacing: "-0.02em",
          }}
        >
          Automation Rules
        </h1>

        <p style={{ fontSize: "1.2vw", color: "#9AA5CE", lineHeight: 1.5, margin: "0 0 3.5vh 0" }}>
          Price-triggered rules execute automatically when a live market condition is met. Evaluated on every Kraken price tick.
        </p>

        <div style={{ display: "flex", gap: "3vw", flex: 1 }}>

          {/* Steps column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2.5vh" }}>
            <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1vh" }}>
              How to create a rule
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
              <div style={{ width: "1.8vw", height: "1.8vw", borderRadius: "50%", backgroundColor: "rgba(122, 162, 247, 0.12)", border: "1px solid rgba(122, 162, 247, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7AA2F7", fontSize: "1vw", fontWeight: 700, flexShrink: 0 }}>1</div>
              <div>
                <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>Open Automations</div>
                <div style={{ fontSize: "1vw", color: "#9AA5CE", lineHeight: 1.4 }}>Navigate to the Automations tab in the sidebar</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
              <div style={{ width: "1.8vw", height: "1.8vw", borderRadius: "50%", backgroundColor: "rgba(158, 206, 106, 0.12)", border: "1px solid rgba(158, 206, 106, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ECE6A", fontSize: "1vw", fontWeight: 700, flexShrink: 0 }}>2</div>
              <div>
                <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>Define the condition</div>
                <div style={{ fontSize: "1vw", color: "#9AA5CE", lineHeight: 1.4 }}>Choose symbol, trigger direction (gte / lte), and price threshold</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
              <div style={{ width: "1.8vw", height: "1.8vw", borderRadius: "50%", backgroundColor: "rgba(224, 175, 104, 0.12)", border: "1px solid rgba(224, 175, 104, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#E0AF68", fontSize: "1vw", fontWeight: 700, flexShrink: 0 }}>3</div>
              <div>
                <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>Set the action</div>
                <div style={{ fontSize: "1vw", color: "#9AA5CE", lineHeight: 1.4 }}>Side (buy/sell), quantity, order type, and target broker</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
              <div style={{ width: "1.8vw", height: "1.8vw", borderRadius: "50%", backgroundColor: "rgba(255, 158, 100, 0.12)", border: "1px solid rgba(255, 158, 100, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9E64", fontSize: "1vw", fontWeight: 700, flexShrink: 0 }}>4</div>
              <div>
                <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>Monitor status</div>
                <div style={{ fontSize: "1vw", color: "#9AA5CE", lineHeight: 1.4 }}>Rules move from active → triggered → completed or failed</div>
              </div>
            </div>
          </div>

          {/* Code column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1vh", marginBottom: "1.5vh" }}>
              Rule Payload
            </div>
            <div
              style={{
                backgroundColor: "#16161E",
                borderRadius: "0.5vw",
                padding: "2vh 1.8vw",
                border: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "1vw",
                lineHeight: 1.7,
                flex: 1,
              }}
            >
              <div style={{ color: "#7AA2F7", marginBottom: "0.5vh" }}>POST /automations</div>
              <div style={{ color: "#C0CAF5" }}>{`{`}</div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"symbol"</span>: <span style={{ color: "#9ECE6A" }}>"BTC-USDT"</span>,
              </div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"condition"</span>: <span style={{ color: "#9ECE6A" }}>"lte"</span>,
              </div>
              <div style={{ paddingLeft: "2vw", backgroundColor: "rgba(158, 206, 106, 0.1)", borderRadius: "0.3vw", padding: "0.3vh 2vw", margin: "0.2vh -2vw" }}>
                <span style={{ color: "#7AA2F7" }}>"triggerPrice"</span>: <span style={{ color: "#FF9E64" }}>80000</span>,
              </div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"side"</span>: <span style={{ color: "#9ECE6A" }}>"buy"</span>,
              </div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"quantity"</span>: <span style={{ color: "#FF9E64" }}>0.1</span>,
              </div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"orderType"</span>: <span style={{ color: "#9ECE6A" }}>"market"</span>,
              </div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"broker"</span>: <span style={{ color: "#9ECE6A" }}>"paper"</span>
              </div>
              <div style={{ color: "#C0CAF5" }}>{`}`}</div>
            </div>
          </div>

        </div>

        <div style={{ marginTop: "2vh", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>04</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Tradora, Inc.</div>
        </div>
      </div>
    </div>
  );
}
