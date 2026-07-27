import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // 3D Tilt Effect
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y - rect.height / 2) / rect.height) * 10;
    const rotateY = ((x - rect.width / 2) / rect.width) * -10;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const resetTilt = () => {
    cardRef.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
  };

  

  return (
    <div className="home-wrapper fade-in">

      <div className="particles"></div>

      <button
        className="theme-toggle"
        onClick={() => document.body.classList.toggle("light-mode")}
      >
        🌗 Toggle Theme
      </button>

      <div
        className="glass-card pulse-glow"
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
      >
        <div className="cpu-icon">⚙️</div>

        <h1 className="title">Priority in Motion</h1>

        <h2 className="subtitle">
          Adaptive Priority Scheduling Engine
        </h2>

        <p className="description">
          A real-time preemptive CPU scheduling simulator powered by intelligent
          aging and starvation prevention.
        </p>

        <div className="stats">
          <span>⚡ Preemptive Execution</span>
          <span>🛡 Starvation Prevention</span>
          <span>📊 Real-Time Metrics</span>
        </div>

        <button
  className="launch-btn ripple"
  onClick={() => setTimeout(() => navigate("/input"), 300)}
>
  🚀 Launch Scheduler
</button>

        <div className="features-section">
          <div className="feature-card">⚡ Fast Preemptive Switching</div>
          <div className="feature-card">🛡 Smart Aging Logic</div>
          <div className="feature-card">📊 Performance Analytics</div>
        </div>

        <div className="dashboard-preview">
          <h3>Live Performance Snapshot</h3>
          <div className="metrics">
            <div>AWT ↓ </div>
            <div>ATAT ↓ </div>
            <div>CPU Utilization ↑ </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;