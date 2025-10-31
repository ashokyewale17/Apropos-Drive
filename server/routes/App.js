import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddEmployee from "./pages/AddEmployee";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/add-employee" element={<AddEmployee />} />
        {/* you can add other admin routes here */}
      </Routes>
    </Router>
  );
}

export default App;

