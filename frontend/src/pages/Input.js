import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./Input.css";

function Input() {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState("");

  /* ---------------- ADD PROCESS ---------------- */
  const addRow = () => {
    setProcesses([
      ...processes,
      {
        id: "P" + (processes.length + 1),
        arrival: 0,
        burst: 1,
        priority: 1,
      },
    ]);
  };

  /* ---------------- REMOVE ---------------- */
  const removeRow = (index) => {
    const updated = processes.filter((_, i) => i !== index);
    setProcesses(updated);
  };

  /* ---------------- UPDATE ---------------- */
  const updateProcess = (index, field, value) => {
    const updated = [...processes];
    updated[index][field] = Number(value);
    setProcesses(updated);
  };

  /* ---------------- DRAG REORDER ---------------- */
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(processes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setProcesses(items);
  };

  /* ---------------- LIVE SUMMARY ---------------- */
  const summary = useMemo(() => {
    if (!processes.length) return null;

    const total = processes.length;
    const avg =
      processes.reduce((sum, p) => sum + p.burst, 0) / total;

    return {
      total,
      avg: avg.toFixed(2),
    };
  }, [processes]);

  /* ---------------- CHART DATA ---------------- */
  const burstData = processes.map((p) => ({
    name: p.id,
    burst: p.burst,
  }));
const priorityData = processes.map((p) => ({
  name: p.id,
  value: p.priority
}));
  
  const COLORS = ["#00f7ff", "#ff4b5c", "#f9c74f", "#90be6d"];

  const runSimulation = async () => {
    const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: mode, processes }),
    });

    const data = await res.json();
    navigate("/simulation", { state: { output: data } });
  };

  return (
    <div className="dashboard">

      {/* ---------------- SIDEBAR ---------------- */}
      <div className="sidebar">
        <h2>CPU Studio</h2>
        <ul>
          <li className="active">Input</li>
          <li>Simulation</li>
          <li>Analytics</li>
        </ul>
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="main-content">

        <div className="header">
          <h1>CPU Scheduling Studio</h1>
          <button
            onClick={() =>
              document.body.classList.toggle("light-mode")
            }
          >
            🌗 Theme
          </button>
        </div>

        <div className="content-grid">

          {/* -------- PROCESS TABLE -------- */}
          <div className="card">

            <h3>Process Input</h3>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="processes">
                {(provided) => (
                  <table
                    className="process-table"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <thead>
                      <tr>
                        <th>Drag</th>
                        <th>ID</th>
                        <th>Arrival</th>
                        <th>Burst</th>
                        <th>Priority</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processes.map((p, index) => (
                        <Draggable
                          key={p.id}
                          draggableId={p.id}
                          index={index}
                        >
                          {(provided) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`priority-${p.priority}`}
                            >
                              <td {...provided.dragHandleProps}>
                                ⋮⋮
                              </td>
                              <td>{p.id}</td>
                              <td>
                                <input
                                  type="number"
                                  value={p.arrival}
                                  onChange={(e) =>
                                    updateProcess(
                                      index,
                                      "arrival",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={p.burst}
                                  onChange={(e) =>
                                    updateProcess(
                                      index,
                                      "burst",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={p.priority}
                                  onChange={(e) =>
                                    updateProcess(
                                      index,
                                      "priority",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <button
                                  onClick={() =>
                                    removeRow(index)
                                  }
                                >
                                  ❌
                                </button>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                )}
              </Droppable>
            </DragDropContext>

            <button className="primary-btn" onClick={addRow}>
              + Add Process
            </button>

            {summary && (
              <div className="summary">
                <p>Total: {summary.total}</p>
                <p>Avg Burst: {summary.avg}</p>
              </div>
            )}

            <div className="button-row">
              <button
                onClick={() => {
                  setMode("preemptive");
                  setDrawerOpen(true);
                }}
              >
                Preemptive
              </button>

              <button
                onClick={() => {
                  setMode("nonpreemptive");
                  setDrawerOpen(true);
                }}
              >
                Non-Preemptive
              </button>
            </div>

          </div>

          {/* -------- ANALYTICS PANEL -------- */}
          <div className="card">

            <h3>Live Analytics</h3>

            <div className="chart-box">
              <h4>Burst Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={burstData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="burst" fill="#00f7ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h4>Priority Spread</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    outerRadius={80}
                    
                  >
                    {priorityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
        formatter={(value, name) => [
          `Priority: ${value}`,
          `Process: ${name}`
        ]}
      />

                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>

        </div>
      </div>

      {/* -------- SLIDE DRAWER -------- */}
      <div className={`drawer ${drawerOpen ? "open" : ""}`}>
        <h3>Simulation Summary</h3>
        <p>Mode: {mode}</p>
        <p>Processes: {processes.length}</p>
        <button onClick={runSimulation}>
          Run Simulation
        </button>
        <button onClick={() => setDrawerOpen(false)}>
          Cancel
        </button>
      </div>

    </div>
  );
}

export default Input;