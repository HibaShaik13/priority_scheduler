import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">CPU Scheduler</h2>
        <nav>
          <ul>
            <li className="active">Dashboard</li>
            <li>Algorithms</li>
            <li>Results</li>
            <li>Analytics</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main">

        {/* Topbar */}
        <header className="topbar">
          <h1>Priority Scheduling Results</h1>
          <div className="profile">Admin</div>
        </header>

        {/* Stats Cards */}
        <div className="stats">
          <div className="stat-card">
            <h3>Average Waiting Time</h3>
            <p>12.4 ms</p>
          </div>

          <div className="stat-card">
            <h3>Average Turnaround</h3>
            <p>18.7 ms</p>
          </div>

          <div className="stat-card">
            <h3>CPU Utilization</h3>
            <p>94%</p>
          </div>
        </div>

        {/* Gantt Section */}
        <div className="glass-card">
          <div className="section-header">
            <h2>Execution Timeline</h2>
            <div className="cpu-indicator"></div>
          </div>

          <div className="gantt-container">
            <div className="gantt-bar" style={{ width: "140px", background: "#00f2fe" }}>P1</div>
            <div className="gantt-bar" style={{ width: "100px", background: "#4facfe" }}>P2</div>
            <div className="gantt-bar" style={{ width: "80px", background: "#00ffcc" }}>P3</div>
          </div>
        </div>

        {/* Table Section */}
        <div className="glass-card">
          <h2>Process Details</h2>
          <table>
            <thead>
              <tr>
                <th>Process</th>
                <th>Arrival</th>
                <th>Burst</th>
                <th>Priority</th>
                <th>Waiting</th>
                <th>Turnaround</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>P1</td>
                <td>0</td>
                <td>5</td>
                <td>1</td>
                <td>2</td>
                <td>7</td>
              </tr>
              <tr>
                <td>P2</td>
                <td>1</td>
                <td>3</td>
                <td>2</td>
                <td>4</td>
                <td>7</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;