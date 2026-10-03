import { useState } from "react";

function VoiceInput({ onTranscript }) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event) => {
        alert(`Voice error: ${event.error}`);
        console.log("Voice recognition error:", event.error);
        setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <button
      type="button"
      className="voice-button"
      onClick={startListening}
    >
      {listening ? "Listening..." : "🎤 Speak"}
    </button>
  );
}

export default VoiceInput;