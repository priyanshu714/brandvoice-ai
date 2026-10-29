
import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "";

const initialForm = {
  brandName: "",
  industry: "",
  objective: "Engagement",
  productDetails: "",
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [brandVoice, setBrandVoice] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setCopiedIndex(null);
    setCopiedAll(false);

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate tweets.");
      }

      const generatedTweets = Array.isArray(data.tweets)
        ? data.tweets
        : [];

      if (generatedTweets.length !== 10) {
        throw new Error(
          "The AI must return exactly 10 tweets. Please try again."
        );
      }

      setBrandVoice(data.brandVoice || data.brand_voice || null);
      setTweets(
        generatedTweets.map((tweet, index) => ({
          id: index + 1,
          text:
            typeof tweet === "string"
              ? tweet
              : tweet.text || tweet.content || "",
          style:
            typeof tweet === "string"
              ? "AI-generated"
              : tweet.style || tweet.type || "AI-generated",
        }))
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);

      setTimeout(() => setCopiedIndex(null), 1800);
    } catch {
      setError("Could not copy the tweet. Please copy it manually.");
    }
  };

  const copyAllTweets = async () => {
    try {
      const allTweets = tweets
        .map((tweet, index) => `${index + 1}. ${tweet.text}`)
        .join("\n\n");

      await navigator.clipboard.writeText(allTweets);
      setCopiedAll(true);

      setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      setError("Could not copy all tweets. Please try again.");
    }
  };

  const getVoiceList = (value) => {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "string") return value;
    return "Not specified";
  };

  const resetResults = () => {
    setBrandVoice(null);
    setTweets([]);
    setError("");
    setCopiedIndex(null);
    setCopiedAll(false);
  };

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="#home">
          <span className="logo-mark">A</span>
          <span>Assignment</span>
          <span className="logo-ai">AI</span>
        </a>

        <span className="nav-label">
          <span className="status-dot"></span>
          Brand Studio
        </span>
      </header>

      <main id="home" className="main-container">
        <section className="hero">
          <span className="eyebrow">
            <span>✦</span> AI-POWERED CONTENT STUDIO
          </span>

          <h1>
            Your brand.
            <br />
            <span className="gradient-text">Your voice.</span>
            <br />
            Ten great tweets.
          </h1>

          <p className="hero-description">
            Turn your brand identity into social content that sounds like
            you. Generate ten unique tweet ideas in seconds.
          </p>
        </section>

        <section className="workspace">
          <div className="form-panel">
            <div className="panel-heading">
              <div className="step-number">01</div>
              <div>
                <h2>Tell us about your brand</h2>
                <p>A little context goes a long way.</p>
              </div>
            </div>

            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label htmlFor="brandName">
                  Brand name <span className="optional">Optional</span>
                </label>
                <input
                  id="brandName"
                  name="brandName"
                  value={form.brandName}
                  onChange={handleChange}
                  placeholder="e.g. Nike, Zomato, your startup"
                />
              </div>

              <div className="form-group">
                <label htmlFor="industry">
                  Industry / category{" "}
                  <span className="optional">Optional</span>
                </label>
                <input
                  id="industry"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="e.g. Fashion, food, technology"
                />
              </div>

              <div className="form-group">
                <label htmlFor="objective">Campaign objective</label>
                <select
                  id="objective"
                  name="objective"
                  value={form.objective}
                  onChange={handleChange}
                  required
                >
                  <option value="Engagement">Boost engagement</option>
                  <option value="Promotion">Promote a product</option>
                  <option value="Awareness">Build brand awareness</option>
                  <option value="Education">Educate the audience</option>
                  <option value="Community">Build a community</option>
                  <option value="Launch">Announce a launch</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="productDetails">
                  Product / brand details{" "}
                  <span className="optional">Optional</span>
                </label>
                <textarea
                  id="productDetails"
                  name="productDetails"
                  value={form.productDetails}
                  onChange={handleChange}
                  placeholder="What do you sell? Who is it for? What makes it different? Add any offers or campaign details."
                  rows="5"
                />
              </div>

              <button
                className="generate-button"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Generating your tweets...
                  </>
                ) : (
                  <>
                    <span>✦</span>
                    Generate 10 tweets
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>

              
            </form>
          </div>

          <div className="results-panel">
            {!brandVoice && tweets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✳</div>
                <span className="empty-label">WORKSPACE</span>
                <h2>It start here.</h2>
                <p>
                  Fill the brand details and let AI turn them into
                  on-brand content.
                </p>

                <div className="preview-list">
                  <div className="preview-item">
                    <span className="preview-icon">◉</span>
                    <div>
                      <strong>Brand voice analysis</strong>
                      <small>Understand your brand personality</small>
                    </div>
                  </div>

                  <div className="preview-item">
                    <span className="preview-icon">✎</span>
                    <div>
                      <strong>10 unique tweets</strong>
                      <small>Different formats and creative angles</small>
                    </div>
                  </div>

                  <div className="preview-item">
                    <span className="preview-icon">↗</span>
                    <div>
                      <strong>Ready to use</strong>
                      <small>Copy your favorites in one click</small>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="results-content">
                <div className="results-heading">
                  <div>
                    <span className="empty-label">YOUR RESULTS</span>
                    <h2>Content that clicks.</h2>
                    <p>
                      {form.brandName.trim() || "Your brand"} ·{" "}
                      {tweets.length} tweets generated
                    </p>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    ↻ Regenerate
                  </button>
                </div>

                {brandVoice && (
                  <div className="voice-card">
                    <div className="voice-title">
                      <span>✳</span>
                      <h3>Brand voice</h3>
                    </div>

                    <div className="voice-row">
                      <strong>Tone</strong>
                      <span>
                        {getVoiceList(
                          brandVoice.tone || brandVoice.tones
                        )}
                      </span>
                    </div>

                    <div className="voice-row">
                      <strong>Audience</strong>
                      <span>
                        {getVoiceList(
                          brandVoice.targetAudience ||
                            brandVoice.target_audience
                        )}
                      </span>
                    </div>

                    <div className="voice-row">
                      <strong>Themes</strong>
                      <span>
                        {getVoiceList(
                          brandVoice.contentThemes ||
                            brandVoice.content_themes
                        )}
                      </span>
                    </div>

                    {brandVoice.summary && (
                      <p className="voice-summary">
                        {brandVoice.summary}
                      </p>
                    )}
                  </div>
                )}

                <div className="tweets-heading">
                  <h3>Your 10 tweets</h3>
                  <button
                    type="button"
                    className="text-button"
                    onClick={copyAllTweets}
                  >
                    {copiedAll ? "✓ Copied all" : "▣ Copy all"}
                  </button>
                </div>

                <div className="tweet-list">
                  {tweets.map((tweet, index) => (
                    <article className="tweet-card" key={tweet.id}>
                      <div className="tweet-top">
                        <span className="tweet-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="tweet-style">{tweet.style}</span>
                      </div>

                      <p className="tweet-text">{tweet.text}</p>

                      <div className="tweet-footer">
                        <span>
                          {tweet.text.length} characters
                        </span>
                        <button
                          type="button"
                          className="copy-button"
                          onClick={() => copyText(tweet.text, index)}
                        >
                          {copiedIndex === index
                            ? "✓ Copied"
                            : "▣ Copy tweet"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="error-message" role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <footer className="footer">
          <span>Assignment for Confluencr</span>
          <span>Made by Priyanshu Singh</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
