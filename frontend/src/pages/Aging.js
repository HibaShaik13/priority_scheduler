import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./Simulation.css";

const cpuImage =
  "https://t3.ftcdn.net/jpg/02/26/07/38/360_F_226073875_pAXMTrDH9XokT4qKe0Yv4wsDpJgHifkN.jpg";

function Aging() {
  const location = useLocation();
  const navigate = useNavigate();

  const oldOutput = location.state?.output || null;

  const [output, setOutput] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [movingProcess, setMovingProcess] = useState(null);
  const [stage, setStage] = useState("idle");
  const [completed, setCompleted] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [clock, setClock] = useState(0);
  const [waitingStatus, setWaitingStatus] = useState({});
  const [previousPriorities, setPreviousPriorities] = useState({});

  const timerRef = useRef(null);
  const ganttRef = useRef(null);

  /* 🔥 CALL BACKEND */

useEffect(() => {
  if (!oldOutput) return;

  const algorithmType = location.state?.type || "preemptive";
  const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  fetch(`${backendUrl}/aging`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      processes: oldOutput.processes,
      type: algorithmType   // 🔥 dynamic type
    })
  })
    .then(res => res.json())
    .then(data => {
      setOutput(data);
    });
}, [oldOutput, location.state]);
  const gantt = output?.gantt || [];

  const colors = {};
  if (output?.processes) {
    output.processes.forEach((p, i) => {
      colors[p.id] = `hsl(${i * 65}, 70%, 60%)`;
    });
  }

  const processCount = output?.processes?.length || 0;
  const dynamicHeight = Math.max(380, processCount * 85);
  const boxSize = processCount > 6 ? 60 : 75;

  const totalTime =
    gantt.length > 0
      ? gantt[gantt.length - 1].end
      : 1;

  const containerWidth =
    ganttRef.current?.clientWidth || 1;

  const scale =
    totalTime > 0
      ? containerWidth / totalTime
      : 1;

  /* CLOCK */
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setClock((prev) => {
        if (prev >= totalTime) {
          clearInterval(interval);
          return totalTime;
        }
        return prev + 0.1;
      });
    }, 100 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, totalTime]);

  /* PROCESS FLOW */
  useEffect(() => {
    if (!isPlaying) return;
    if (!gantt || currentIndex >= gantt.length) return;

    const block = gantt[currentIndex];
    const duration =
      ((block.end - block.start) * 1000) / speed;

    setMovingProcess(block.process);
    setStage("toCPU");

    timerRef.current = setTimeout(() => {
      setStage("inCPU");

      timerRef.current = setTimeout(() => {
        setStage("toGantt");

        timerRef.current = setTimeout(() => {
          setCompleted((prev) => [...prev, block]);
          setMovingProcess(null);
          setStage("idle");
          setCurrentIndex((prev) => prev + 1);
        }, 600 / speed);
      }, duration);
    }, 600 / speed);

    return () => clearTimeout(timerRef.current);
  }, [currentIndex, gantt, isPlaying, speed]);

  /* ✅ FIXED AGING LOGIC */
  useEffect(() => {
    if (!output?.processes || !oldOutput?.processes) return;

    const updatedStatus = {};
    const history = { ...previousPriorities };

    output.processes.forEach((p) => {

      const isCompleted = completed.some(
        (c) => c.process === p.id
      );

      const isRunning =
        movingProcess === p.id &&
        stage === "inCPU";

      if (
        clock >= p.arrival &&
        !isCompleted &&
        !isRunning
      ) {

        const waitTime = clock - p.arrival;

        if (waitTime >= 10) {

          updatedStatus[p.id] = "Starving";

          const originalPriority =
            oldOutput.processes.find(
              (proc) => proc.id === p.id
            )?.priority;

          // ✅ decrease 1 for every 10 units waited
          const agingSteps = Math.floor(waitTime / 10);

          let newPriority =
            originalPriority - agingSteps;

          if (newPriority < 1)
            newPriority = 1;

          if (!history[p.id]) {
            history[p.id] = [originalPriority];
          }

          const last =
            history[p.id][history[p.id].length - 1];

          if (newPriority < last) {
            history[p.id] = [
              ...history[p.id],
              newPriority
            ];
          }

        } else {
          updatedStatus[p.id] = "Waiting";
        }

      } else {
        updatedStatus[p.id] = "";
      }

    });

    setPreviousPriorities(history);
    setWaitingStatus(updatedStatus);

  }, [
    clock,
    movingProcess,
    stage,
    completed,
    output,
    oldOutput
  ]);

  const restartSimulation = () => {
    setCurrentIndex(0);
    setCompleted([]);
    setMovingProcess(null);
    setStage("idle");
    setClock(0);
    setWaitingStatus({});
    setPreviousPriorities({});
    setIsPlaying(true);
  };

  const completedTime =
    completed.length > 0
      ? completed[completed.length - 1].end
      : 0;

  const progress =
    totalTime > 0
      ? (completedTime / totalTime) * 100
      : 0;

  return (
    <div className="simulation-container">
      {!output ? (
        <div>Applying Aging Algorithm...</div>
      ) : (
        <>
          <h2 className="title">
            🔥 Aging Process for Starvation
          </h2>

          <div className="controls">
            <button onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? "Pause" : "Play"}
            </button>

            <button onClick={restartSimulation}>
              Restart
            </button>

            <label style={{ color : "black"}}>Speed:</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={speed}
              onChange={(e) =>
                setSpeed(Number(e.target.value))
              }
            />
            <span style={{color:"black"}}>{speed}x</span>

            <div className="clock">
              ⏱ Time: {clock.toFixed(1)}
            </div>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            className="simulation-area"
            style={{ height: dynamicHeight }}
          >
            <div className="left-panel">
              <div className="process-header">
                <span>AT</span>
                <span>BT</span>
                <span>PR</span>
                <span></span>
              </div>

              {output.processes.map((p) => (
                <div key={p.id} className="process-row">
                  <div className="process-values">
                    <span>{p.arrival}</span>
                    <span>{p.burst}</span>
                    <span>
                      {previousPriorities[p.id]
                        ? previousPriorities[p.id].map(
                            (val, index) => {
                              const isLast =
                                index ===
                                previousPriorities[p.id]
                                  .length - 1;

                              return (
                                <span key={index}>
                                  {isLast ? (
                                    <span style={{
                                      color: "red",
                                      fontWeight: "bold",
                                      marginRight: "6px"
                                    }}>
                                      {val}
                                    </span>
                                  ) : (
                                    <span style={{
                                      textDecoration: "line-through",
                                      color: "#888",
                                      marginRight: "6px"
                                    }}>
                                      {val}
                                    </span>
                                  )}
                                </span>
                              );
                            }
                          )
                        : p.priority ?? "-"}
                    </span>
                  </div>

                  <div
                    className="process-static"
                    style={{
                      backgroundColor: colors[p.id],
                      width: boxSize,
                      height: boxSize
                    }}
                  >
                    {p.id}
                  </div>

                  {waitingStatus[p.id] && (
                    <div
                      className={
                        waitingStatus[p.id] === "Starving"
                          ? "starving-text"
                          : "waiting-text"
                      }
                    >
                      {waitingStatus[p.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={`cpu-section ${stage === "inCPU" ? "active-cpu" : ""}`}>
              <img src={cpuImage} alt="CPU" />
            </div>

            {movingProcess && (
              <div
                className={`moving-box ${stage}`}
                style={{
                  backgroundColor: colors[movingProcess],
                  width: boxSize,
                  height: boxSize
                }}
              >
                {movingProcess}
              </div>
            )}
          </div>

          <h3 style={{color:"black"}}>Gantt Chart</h3>

          <div className="gantt-container" ref={ganttRef}>
            {completed.map((block, index) => (
              <div
                key={index}
                className="gantt-block"
                style={{
                  width: (block.end - block.start) * scale,
                  backgroundColor: colors[block.process]
                }}
              >
                {block.process}
                <span className="completion-time">
                  {block.end}
                </span>
              </div>
            ))}
           
          </div>
        </>
      )}
       <button
  className="comparision-btn"
  onClick={() =>
    navigate("/results2", {
      state: {
        before: oldOutput,
        after: output
      }
    })
  }
>
  View Comparison Results
</button>
    </div>

  );
}

export default Aging;