import AvatarViewer from "./AvatarViewer";
import VoiceInput from "./VoiceInput";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const situations = [
  "general",
  "emergency",
  "hospital",
  "transportation",
  "college",
];

function App() {
  const [message, setMessage] = useState("");
  const [situation, setSituation] = useState("general");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateSigns(event) {
    event.preventDefault();

    if (!message.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          situation,
        }),
      });

      if (!response.ok) {
        throw new Error("The backend could not analyze this message.");
      }

      const data = await response.json();
      setResult(data);
    } catch (requestError) {
      setError(
        requestError.message +
          " Make sure the FastAPI server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setMessage("");
    setResult(null);
    setError("");
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">ACCESSIBLE COMMUNICATION MVP</p>

        <h1>VoxaSign AI</h1>

        <p className="subtitle">
          Convert a spoken or typed message into a context-aware sign sequence.
        </p>
      </section>

      <form className="input-panel" onSubmit={generateSigns}>
        <label htmlFor="situation">Situation</label>

        <select
          id="situation"
          value={situation}
          onChange={(event) => setSituation(event.target.value)}
        >
          {situations.map((option) => (
            <option key={option} value={option}>
              {option[0].toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>

        <div className="example-buttons">
          <p>Try an example:</p>

          <button
            type="button"
            onClick={() =>
              setMessage("There is a fire. Everyone needs to leave.")
            }
          >
            Emergency
          </button>

          <button
            type="button"
            onClick={() => setMessage("I need to see the doctor.")}
          >
            Hospital
          </button>

          <button
            type="button"
            onClick={() =>
              setMessage(
                "The train has been cancelled. Go to platform 4."
              )
            }
          >
            Transportation
          </button>
        </div>

        <label htmlFor="message">Message</label>

        <textarea
          id="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Example: There is a fire. Everyone needs to leave."
          rows="5"
        />

        <VoiceInput onTranscript={setMessage} />

        <button
          type="submit"
          className="generate-button"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Sign"}
        </button>

        <button
          type="button"
          className="clear-button"
          onClick={clearAll}
        >
          Clear
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-heading">
            <p className="eyebrow">ANALYSIS RESULT</p>
            <h2>{result.situation}</h2>
          </div>

          <div className="details-grid">
            <div>
              <span>Intent</span>
              <strong>{result.intent}</strong>
            </div>

            <div>
              <span>Urgency</span>
              <strong>{result.urgency}</strong>
            </div>

            <div>
              <span>Meaning</span>
              <strong>{result.meaning}</strong>
            </div>
          </div>

          <h3>Sign sequence</h3>

          <div className="sign-sequence">
            {result.sign_sequence.map((sign, index) => (
              <span key={`${sign}-${index}`}>{sign}</span>
            ))}
          </div>

          {(result.unavailable_signs || []).length > 0 && (
            <p className="warning">
              Some concepts are not available in the current MVP sign library.
            </p>
          )}

          <AvatarViewer
            signSequence={result.sign_sequence || []}
          />

          <div className="isl-reference">
            <p>
              <strong>Output language:</strong> Indian Sign Language (ISL)
            </p>

            <p className="prototype-note">
              The current avatar motions are prototype placeholders.
              Real ISL animation assets will be added in a later version.
            </p>

            <a
              href="https://www.youtube.com/playlist?list=PLFjydPMg4Dapq9vcdmGyHs8uJhiqMgUrX"
              target="_blank"
              rel="noreferrer"
            >
              View official ISL reference resources
            </a>
          </div>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);