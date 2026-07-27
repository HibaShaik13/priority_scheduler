const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* =====================================================
   NORMAL PRIORITY ROUTE
===================================================== */

app.post("/schedule", (req, res) => {
  const { processes, type } = req.body;

  let result =
    type === "preemptive"
      ? preemptivePriority(processes)
      : nonPreemptivePriority(processes);

  res.json({ ...result, type });
});

/* =====================================================
   AGING ROUTE
===================================================== */

app.post("/aging", (req, res) => {
  const { processes, type } = req.body;

  let result =
    type === "preemptive"
      ? preemptivePriorityAging(processes)
      : nonPreemptivePriorityAging(processes);

  res.json({ ...result, type });
});

/* =====================================================
   COMMON HELPER
===================================================== */

function calculateAverages(list) {
  let totalWT = 0;
  let totalTAT = 0;

  list.forEach(p => {
    totalWT += p.waitingTime;
    totalTAT += p.turnaroundTime;
  });

  return {
    averageWT: (totalWT / list.length).toFixed(2),
    averageTAT: (totalTAT / list.length).toFixed(2)
  };
}

/* =====================================================
   NON PREEMPTIVE PRIORITY
===================================================== */

function nonPreemptivePriority(processes) {
  let time = 0;
  let finished = 0;

  const list = processes.map(p => ({
    ...p,
    remainingTime: p.burst,
    completionTime: 0,
    turnaroundTime: 0,
    waitingTime: 0
  }));

  const gantt = [];

  while (finished < list.length) {
    const ready = list.filter(
      p => p.arrival <= time && p.remainingTime > 0
    );

    if (ready.length === 0) {
      time++;
      continue;
    }

    ready.sort((a, b) => a.priority - b.priority);
    const current = ready[0];

    gantt.push({
      process: current.id,
      start: time,
      end: time + current.remainingTime
    });

    time += current.remainingTime;

    current.remainingTime = 0;
    current.completionTime = time;
    current.turnaroundTime = time - current.arrival;
    current.waitingTime = current.turnaroundTime - current.burst;

    finished++;
  }

  return { processes: list, gantt, ...calculateAverages(list) };
}

/* =====================================================
   PREEMPTIVE PRIORITY
===================================================== */

function preemptivePriority(processes) {
  let time = 0;
  let finished = 0;

  const list = processes.map(p => ({
    ...p,
    remainingTime: p.burst,
    completionTime: 0,
    turnaroundTime: 0,
    waitingTime: 0
  }));

  const gantt = [];

  while (finished < list.length) {
    const ready = list.filter(
      p => p.arrival <= time && p.remainingTime > 0
    );

    if (ready.length === 0) {
      time++;
      continue;
    }

    ready.sort((a, b) => a.priority - b.priority);
    const current = ready[0];

    if (
      gantt.length === 0 ||
      gantt[gantt.length - 1].process !== current.id
    ) {
      gantt.push({ process: current.id, start: time });
    }

    current.remainingTime--;
    time++;
    gantt[gantt.length - 1].end = time;

    if (current.remainingTime === 0) {
      current.completionTime = time;
      current.turnaroundTime = time - current.arrival;
      current.waitingTime = current.turnaroundTime - current.burst;
      finished++;
    }
  }

  return { processes: list, gantt, ...calculateAverages(list) };
}

/* =====================================================
   NON PREEMPTIVE PRIORITY WITH AGING
===================================================== */

function nonPreemptivePriorityAging(processes) {
  let time = 0;
  let finished = 0;

  const list = processes.map(p => ({
    ...p,
    originalPriority: p.priority,
    remainingTime: p.burst,
    completionTime: 0,
    turnaroundTime: 0,
    waitingTime: 0
  }));

  const gantt = [];

  while (finished < list.length) {
    const ready = list.filter(
      p => p.arrival <= time && p.remainingTime > 0
    );

    if (ready.length === 0) {
      time++;
      continue;
    }

    ready.forEach(p => {
      const waiting = time - p.arrival;

      p.effectivePriority = Math.max(
        1,
        p.originalPriority - waiting
      );

      // ✅ STORE UPDATED PRIORITY
      p.priority = p.effectivePriority;
    });

    ready.sort((a, b) => a.effectivePriority - b.effectivePriority);

    const current = ready[0];

    gantt.push({
      process: current.id,
      start: time,
      end: time + current.remainingTime
    });

    time += current.remainingTime;

    current.remainingTime = 0;
    current.completionTime = time;
    current.turnaroundTime = time - current.arrival;
    current.waitingTime = current.turnaroundTime - current.burst;

    finished++;
  }

  return { processes: list, gantt, ...calculateAverages(list) };
}

/* =====================================================
   PREEMPTIVE PRIORITY WITH AGING
===================================================== */

function preemptivePriorityAging(processes) {
  let time = 0;
  let finished = 0;

  const list = processes.map(p => ({
    ...p,
    originalPriority: p.priority,
    remainingTime: p.burst,
    completionTime: 0,
    turnaroundTime: 0,
    waitingTime: 0
  }));

  const gantt = [];

  while (finished < list.length) {
    const ready = list.filter(
      p => p.arrival <= time && p.remainingTime > 0
    );

    if (ready.length === 0) {
      time++;
      continue;
    }

    ready.forEach(p => {
      const executed = p.burst - p.remainingTime;
      const waiting = time - p.arrival - executed;

      const ratio =
        p.originalPriority === 0
          ? 0
          : waiting / p.originalPriority;

      p.effectivePriority = Math.max(
        1,
        p.originalPriority - Math.floor(ratio)
      );

      // ✅ STORE UPDATED PRIORITY
      p.priority = p.effectivePriority;
    });

    ready.sort((a, b) => {
      if (a.effectivePriority === b.effectivePriority)
        return a.arrival - b.arrival;
      return a.effectivePriority - b.effectivePriority;
    });

    const current = ready[0];

    if (
      gantt.length === 0 ||
      gantt[gantt.length - 1].process !== current.id
    ) {
      gantt.push({ process: current.id, start: time });
    }

    current.remainingTime--;
    time++;
    gantt[gantt.length - 1].end = time;

    if (current.remainingTime === 0) {
      current.completionTime = time;
      current.turnaroundTime = time - current.arrival;
      current.waitingTime = current.turnaroundTime - current.burst;
      finished++;
    }
  }

  return { processes: list, gantt, ...calculateAverages(list) };
}

/* =====================================================
   START SERVER
===================================================== */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});