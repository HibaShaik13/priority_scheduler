import React, { useEffect, useState } from "react";
import "./Simulation.css";

const cpuImage =
  "https://t3.ftcdn.net/jpg/02/26/07/38/360_F_226073875_pAXMTrDH9XokT4qKe0Yv4wsDpJgHifkN.jpg";

function SimulationPage({ data, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeProcess, setActiveProcess] = useState(null);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    if (!data || currentIndex >= data.gantt.length) return;

    const block = data.gantt[currentIndex];
    const duration = (block.end - block.start) * 1000;

    setActiveProcess(block.process);

    const timer = setTimeout(() => {
      setCompleted(prev => [...prev, block]);
      setActiveProcess(null);
      setCurrentIndex(prev => prev + 1);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, data]);

  if (!data) return <h2>No Data</h2>;

  return (
    <div className="simulation-container">

      <h2>CPU Simulation</h2>

      <div className="simulation-layout">

        {/* LEFT SIDE PROCESS BOXES */}
        <div className="process-list">
          {data.processes.map(p => (
            <div
              key={p.id}
              className={`process-box ${activeProcess === p.id ? "active" : ""}`}
            >
              {p.id}
            </div>
          ))}
        </div>

        {/* CPU IMAGE */}
        <div className="cpu-area">
          <img src={cpuImage} alt="CPU" />
          {activeProcess && (
            <div className="cpu-process">
              {activeProcess}
            </div>
          )}
        </div>
      </div>

      {/* GANTT CHART */}
      <h3>Gantt Chart</h3>
      <div className="gantt-container">
        {completed.map((block, index) => (
          <div
            key={index}
            className="gantt-block"
            style={{
              width: (block.end - block.start) * 60
            }}
          >
            {block.process}
          </div>
        ))}
      </div>

      {/* Time Line */}
      <div className="timeline">
        {completed.length > 0 && (
          <>
            <span>{completed[0].start}</span>
            {completed.map((block, i) => (
              <span key={i}>{block.end}</span>
            ))}
          </>
        )}
      </div>

      {/* NEXT BUTTON */}
      {currentIndex >= data.gantt.length && (
        <button className="result-btn" onClick={onFinish}>
          View Results
        </button>
      )}

    </div>
  );
}

export default SimulationPage;