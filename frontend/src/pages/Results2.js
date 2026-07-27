/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import "./Results2.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

function Results2() {
  const location = useLocation();
  const navigate = useNavigate();

  const before = location.state?.before;
  const after = location.state?.after;

  const [chartType, setChartType] = useState("bar");
  const [cpuRunning, setCpuRunning] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [typedText, setTypedText] = useState("");

  // 🔥 NEW STATES FOR ANIMATION
  const [animatedWT, setAnimatedWT] = useState(0);
  const [animatedTAT, setAnimatedTAT] = useState(0);

  
  /* ================= CPU Indicator ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuRunning((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  /* ================= Chart Data ================= */

  const chartData = [
    { name: "Average WT", Before: before.averageWT, After: after.averageWT },
    { name: "Average TAT", Before: before.averageTAT, After: after.averageTAT },
  ];

  /* ================= Improvement ================= */

  const wtImprovement =
    before.averageWT !== 0
      ? (
          ((before.averageWT - after.averageWT) / before.averageWT) *
          100
        ).toFixed(2)
      : 0;

  const tatImprovement =
    before.averageTAT !== 0
      ? (
          ((before.averageTAT - after.averageTAT) / before.averageTAT) *
          100
        ).toFixed(2)
      : 0;

  // 🔥 COUNTER ANIMATION
  useEffect(() => {
    let wtStart = 0;
    let tatStart = 0;

    const wtTarget = parseFloat(wtImprovement);
    const tatTarget = parseFloat(tatImprovement);

    const interval = setInterval(() => {
      wtStart += wtTarget / 40;
      tatStart += tatTarget / 40;

      if (Math.abs(wtStart) >= Math.abs(wtTarget)) {
        wtStart = wtTarget;
      }

      if (Math.abs(tatStart) >= Math.abs(tatTarget)) {
        tatStart = tatTarget;
      }

      setAnimatedWT(wtStart.toFixed(2));
      setAnimatedTAT(tatStart.toFixed(2));

      if (
        Math.abs(wtStart) === Math.abs(wtTarget) &&
        Math.abs(tatStart) === Math.abs(tatTarget)
      ) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [wtImprovement, tatImprovement]);

  const recommendation =
    wtImprovement > 10
      ? "Priority Aging significantly reduces starvation and improves fairness."
      : "Aging impact is moderate. Adjust aging factor for better optimization.";

  /* ================= Typewriter ================= */

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(recommendation.slice(0, i));
      i++;
      if (i > recommendation.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [recommendation]);

  /* ================= GANTT ================= */

  const ganttData = after.processes || [];

  useEffect(() => {
    if (ganttData.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) =>
        prev < ganttData.length - 1 ? prev + 1 : 0
      );
    }, 800);
    return () => clearInterval(interval);
  }, [ganttData.length]);

  const totalTime =
    ganttData.length > 0
      ? ganttData[ganttData.length - 1].completionTime
      : 1;
/* ================= SAFETY CHECK ================= */

  if (!before || !after) {
    return (

      <div className="results-wrapper">
        <div className="glass-card">
          <h2>No comparison data available</h2>
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  /* ================= RETURN ================= */
return (
  <div className="results2-dashboard">
    <h1 className="main-title">
  Comparison Between Before Aging and After Aging
</h1>

    {/* ================= TOP AVERAGES ================= */}
    <div className="top-stats">
      <div className="stat-card">
        <h3>Average Waiting Time</h3>
        <p>{after.averageWT}</p>
      </div>

      <div className="stat-card">
        <h3>Average Turnaround Time</h3>
        <p>{after.averageTAT}</p>
      </div>
    </div>

    {/* ================= BEFORE / AFTER TABLES ================= */}
    <div className="tables-row">

      {/* BEFORE */}
      <div className="table-box">
        <h2>Before Aging</h2>
        <table className="premium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>WT</th>
              <th>TAT</th>
              <th>CT</th>
            </tr>
          </thead>
          <tbody>
            {before.processes?.map((p, i) => (
              <tr key={i}>
                <td>{p.id}</td>
                <td>{p.waitingTime}</td>
                <td>{p.turnaroundTime}</td>
                <td>{p.completionTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AFTER */}
      <div className="table-box">
        <h2>After Aging</h2>
        <table className="premium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>WT</th>
              <th>TAT</th>
              <th>CT</th>
            </tr>
          </thead>
          <tbody>
            {after.processes?.map((p, i) => (
              <tr key={i}>
                <td>{p.id}</td>
                <td>{p.waitingTime}</td>
                <td>{p.turnaroundTime}</td>
                <td>{p.completionTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>

    {/* ================= IMPROVEMENTS ================= */}
    <div className="improvement-row">

      <div className="improve-card">
        <h3>Waiting Time Improvement</h3>
        <p className={wtImprovement > 0 ? "green" : "red"}>
          {animatedWT}%
        </p>
      </div>

      <div className="improve-card">
        <h3>Turnaround Time Improvement</h3>
        <p className={tatImprovement > 0 ? "green" : "red"}>
          {animatedTAT}%
        </p>
      </div>

    </div>

    {/* ================= CHARTS ROW ================= */}
    <div className="charts-row">

      {/* BAR CHART */}
      <div className="chart-half">
        <h2>Bar Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Before" fill="#ff4d4d" />
            <Bar dataKey="After" fill="#00ffcc" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LINE CHART */}
      <div className="chart-half">
        <h2>Line Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Before" stroke="#ff4d4d" />
            <Line type="monotone" dataKey="After" stroke="#00ffcc" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>

    {/* ================= GANTT ================= */}
   {/* ================= EXECUTION TIMELINE ================= */}

<div className="timeline-section fade-in">
  <h2 className="section-title">Execution Timeline</h2>
<div className="timeline-container">
  {ganttData.map((proc, index) => (
    <div
      key={index}
      className={`timeline-block ${
        index === activeIndex ? "timeline-active" : ""
      }`}
    >
      <span className="process-label">{proc.id}</span>
      <span className="time-label">{proc.end}</span>
    </div>
  ))}
</div>
 
</div>

    {/* ================= AI RECOMMENDATION ================= */}
    <div className="ai-section">
      <h2>AI Recommendation</h2>
      <div className="ai-box">
        <p className="typewriter">{typedText}</p>
      </div>
    </div>

  </div>
);
}

export default Results2;




