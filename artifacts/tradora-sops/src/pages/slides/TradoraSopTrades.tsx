export default function TradoraSopTrades() {
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
          <div style={{ fontSize: "1vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.8vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px" }} />
            Placing Trades
          </div>
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
          Placing Trades
        </h1>

        <p style={{ fontSize: "1.2vw", color: "#9AA5CE", lineHeight: 1.5, margin: "0 0 3.5vh 0" }}>
          Use the Markets page to route orders to any connected broker. Paper mode uses live Kraken prices as the fill.
        </p>

        {/* Endpoint row */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5vw", marginBottom: "3vh" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "1vh 1.5vw", backgroundColor: "rgba(122, 162, 247, 0.08)", border: "1px solid rgba(122, 162, 247, 0.2)", borderRadius: "0.4vw" }}>
            <div style={{ fontSize: "1vw", fontWeight: 700, color: "#7AA2F7", marginRight: "1vw", fontFamily: "'JetBrains Mono', monospace" }}>POST</div>
            <div style={{ fontSize: "1vw", color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace" }}>/broker-accounts/{"{exchange}"}/orders</div>
          </div>
        </div>

        {/* Two code columns */}
        <div style={{ display: "flex", gap: "3vw", flex: 1 }}>

          {/* Request */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1vh", marginBottom: "1.5vh" }}>
              Request Body
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
              <div style={{ color: "#C0CAF5" }}>{`{`}</div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"symbol"</span>: <span style={{ color: "#9ECE6A" }}>"BTC-USDT"</span>,
              </div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"side"</span>: <span style={{ color: "#9ECE6A" }}>"buy"</span>,
              </div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"qty"</span>: <span style={{ color: "#FF9E64" }}>0.01</span>,
              </div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"type"</span>: <span style={{ color: "#9ECE6A" }}>"market"</span>,
              </div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"broker"</span>: <span style={{ color: "#9ECE6A" }}>"coinbase"</span>
              </div>
              <div style={{ color: "#C0CAF5" }}>{`}`}</div>
            </div>
          </div>

          {/* Response */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1vh", marginBottom: "1.5vh" }}>
              <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF" }}>Response</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5vw" }}>
                <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#9ECE6A", borderRadius: "50%" }} />
                <div style={{ fontSize: "0.9vw", fontFamily: "'JetBrains Mono', monospace", color: "#9ECE6A" }}>201 Created</div>
              </div>
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
              <div style={{ color: "#C0CAF5" }}>{`{`}</div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"id"</span>: <span style={{ color: "#E0AF68" }}>"ord_a1b2c3"</span>,
              </div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"symbol"</span>: <span style={{ color: "#E0AF68" }}>"BTC-USDT"</span>,
              </div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"status"</span>: <span style={{ color: "#E0AF68" }}>"filled"</span>,
              </div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"fillPrice"</span>: <span style={{ color: "#FF9E64" }}>97842.10</span>,
              </div>
              <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}>
                <span style={{ color: "#7AA2F7" }}>"broker"</span>: <span style={{ color: "#E0AF68" }}>"coinbase"</span>
              </div>
              <div style={{ color: "#C0CAF5" }}>{`}`}</div>
            </div>
          </div>

        </div>

        <div style={{ marginTop: "2vh", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>03</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Tradora, Inc.</div>
        </div>
      </div>
    </div>
  );
}
