import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Input from "./pages/Input";
import Simulation from "./pages/Simulation";
import Results1 from "./pages/Results1";
import Results2 from "./pages/Results2";
import Aging from "./pages/Aging";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/input" element={<Input />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/results1" element={<Results1 />} />
        <Route path="/results2" element={<Results2 />} />
        <Route path="/aging" element={<Aging />} />
        <Route path="/dashboard" element={<Dashboard />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;