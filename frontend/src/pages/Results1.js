import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./Results1.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Results1() {
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(null);

  // ✅ Load data safely (from navigation OR localStorage)
  useEffect(() => {
    let incomingData = null;

    if (location.state) {
      if (location.state.output) {
        incomingData = location.state.output;
      } else {
        incomingData = location.state;
      }

      setData(incomingData);
      localStorage.setItem("resultsData", JSON.stringify(incomingData));
    } else {
      const saved = localStorage.getItem("resultsData");
      if (saved) {
        setData(JSON.parse(saved));
      }
    }
  }, [location.state]);

  if (!data) return <h2 className="center">No Results Available</h2>;

  const {
    processes = [],
    gantt = [],
    averageWT = 0,
    averageTAT = 0,
    type = ""
  } = data;

  const totalTime =
    gantt.length > 0
      ? gantt[gantt.length - 1].end
      : 1;

  // ✅ Chart Data
  const chartData = {
    labels: processes.map((p) => p.id),
    datasets: [
      {
        label: "Waiting Time",
        data: processes.map((p) => p.waitingTime),
        backgroundColor: "#ff6384"
      },
      {
        label: "Turnaround Time",
        data: processes.map((p) => p.turnaroundTime),
        backgroundColor: "#36a2eb"
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" }
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 1) return "high";
    if (priority === 2) return "medium";
    return "low";
  };

  return (
    <div className="results-dashboard">
      <div className="header">
        <h1>Simulation Dashboard</h1>
        <p>Priority Scheduling ({type})</p>
      </div>

      {/* KPI SECTION */}
      <div className="kpi-grid">
        <div className="kpi-card gradient1">
          <h3>Average Waiting Time</h3>
          <h2>{averageWT}</h2>
        </div>

        <div className="kpi-card gradient2">
          <h3>Average Turnaround Time</h3>
          <h2>{averageTAT}</h2>
        </div>

        <div className="kpi-card gradient3">
          <h3>Total Processes</h3>
          <h2>{processes.length}</h2>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="chart-section">
        <h2>Performance Chart</h2>
        {processes.length > 0 ? (
          <div style={{ height: "350px" }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p>No performance data available</p>
        )}
      </div>

      {/* TABLE SECTION */}
      <div className="table-section">
        <h2>Process Details</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Arrival</th>
              <th>Burst</th>
              <th>Priority</th>
              <th>Completion</th>
              <th>Waiting</th>
              <th>Turnaround</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.arrival}</td>
                <td>{p.burst}</td>
                <td>
                  <span className={`badge ${getPriorityColor(p.priority)}`}>
                    {p.priority}
                  </span>
                </td>
                <td>{p.completionTime}</td>
                <td>{p.waitingTime}</td>
                <td>{p.turnaroundTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GANTT SECTION */}
      <div className="gantt-section">
        <h2>Execution Timeline</h2>
        <div className="gantt-container">
          {gantt.length > 0 ? (
            gantt.map((g, index) => (
              <div
                key={index}
                className="gantt-bar"
                style={{
                  width: `${((g.end - g.start) / totalTime) * 100}%`,
                  backgroundColor: `hsl(${index * 70}, 70%, 60%)`
                }}
              >
                {g.process}
              </div>
            ))
          ) : (
            <p>No Gantt Data Available</p>
          )}
        </div>
      </div>

      {/* ✅ SOLVE STARVATION BUTTON (SAFE VERSION) */}
      <button
        style={{
          marginTop: "20px",
          backgroundColor: "#ff6b6b",
          color: "white",
          padding: "10px 15px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
        onClick={() =>
          navigate("/aging", {
            state: {
              output: data
            }
          })
        }
      >
        Solve Starvation (Apply Aging)
      </button>
    </div>
  );
}

export default Results1;