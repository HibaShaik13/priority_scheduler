import { useLocation, useNavigate } from "react-router-dom"; 
import { useEffect, useState, useRef, useMemo } from "react"; 
import "./Simulation.css"; 
const cpuImage = 
"https://t3.ftcdn.net/jpg/02/26/07/38/360_F_226073875_pAXMTrDH9XokT4qKe0Yv4wsDpJgHifkN.jpg"; 
function Simulation() { 
const location = useLocation(); 
const navigate = useNavigate(); 
/* ✅ ENSURE OUTPUT STRUCTURE ALWAYS EXISTS */ 
const rawOutput = location.state?.output; 
const output = useMemo(() => ({ 
processes: rawOutput?.processes || [], 
gantt: rawOutput?.gantt || [], 
averageWT: rawOutput?.averageWT ?? 0, 
averageTAT: rawOutput?.averageTAT ?? 0, 
type: rawOutput?.type || "Unknown" 
}), [rawOutput]); 
const gantt = useMemo(() => output?.gantt || [], [output?.gantt]); 
const [currentIndex, setCurrentIndex] = useState(0); 
const [movingProcess, setMovingProcess] = useState(null); 
const [stage, setStage] = useState("idle"); 
const [completed, setCompleted] = useState([]); 
const [isPlaying, setIsPlaying] = useState(true); 
const [speed, setSpeed] = useState(1); 
const [clock, setClock] = useState(0); 
const [waitingStatus, setWaitingStatus] = useState({}); 
const timerRef = useRef(null); 
const ganttRef = useRef(null); 
/* SAFE COLORS */ 
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
/* WAITING + STARVATION LOGIC */ 
useEffect(() => { 
if (!output?.processes) return; 
const updated = {}; 
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
updated[p.id] = "Starving"; 
} else { 
updated[p.id] = "Waiting"; 
} 
} else { 
updated[p.id] = ""; 
} 
},[]); 
setWaitingStatus(updated); 
}, [clock, movingProcess, stage, completed, output]); 
const restartSimulation = () => { 
setCurrentIndex(0); 
setCompleted([]); 
setMovingProcess(null); 
setStage("idle"); 
setClock(0); 
setWaitingStatus({}); 
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
{!rawOutput || !rawOutput.processes ? ( 
<div>No simulation data found.</div> 
) : ( 
<> 
<h2 className="title"> 
🚀 CPU Scheduling Simulation ({output.type}) 
</h2> 
{/* ✅ OPTIONAL DISPLAY OF AVERAGES */} 
<div style={{ marginBottom: "15px", fontWeight: "500", color: "black" }}> 
Average Waiting Time: {output.averageWT} | 
Average Turnaround Time: {output.averageTAT} 
</div> 
<div className="controls"> 
<button onClick={() => setIsPlaying(!isPlaying)}> 
{isPlaying ? "Pause" : "Play"} 
</button> 
<button onClick={restartSimulation}> 
Restart 
</button> 
<label style={{ color: "black" }}>Speed:</label> 
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
<span style={{ color: "black"}}>{speed}x</span> 
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
<span>{p.priority ?? "-"}</span> 
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
<div 
className={`cpu-section ${ 
stage === "inCPU" 
? "active-cpu" 
: "" 
}`} 
> 
<img src={cpuImage} alt="CPU" /> 
</div> 
{movingProcess && ( 
<div 
className={`moving-box ${stage}`} 
style={{ 
backgroundColor: 
colors[movingProcess], 
width: boxSize, 
height: boxSize 
}} 
> 
{movingProcess} 
</div> 
)} 
</div> 
<h3 style={{ color: "black"}}>Gantt Chart</h3> 
<div 
className="gantt-container" 
ref={ganttRef} 
> 
{completed.map((block, index) => ( 
<div 
key={index} 
className="gantt-block" 
style={{ 
width: 
(block.end - block.start) * 
scale, 
backgroundColor: 
colors[block.process] 
}} 
> 
{block.process} 
<span className="completion-time"> 
{block.end} 
</span> 
</div> 
))} 
</div> 
{currentIndex >= gantt.length && (
  <div style={{ marginTop: "30px" }}>
    <button
      className="result-btn"
      onClick={() =>
        navigate("/results1", {
          state: output
        })
      }
    >
      View Final Result
    </button>
  </div>
)}
</> 
)} 
</div> 
); 
} 
export default Simulation;