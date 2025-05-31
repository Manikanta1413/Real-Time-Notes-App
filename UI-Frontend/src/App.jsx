import { SocketProvider } from "./context/SocketContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Notes from "./components/Notes";
import Home from "./components/Home";
import "./App.css";

function App() {
  console.log("Socket URL:", import.meta.env.VITE_SOCKET_URL);

  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/notes" element={<Notes />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
