import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MainTable from "./pages/Main";
import PrivateRoute from "./components/ProtectedRoutes";
import Tasks from "./pages/Tasks";
import Sub_Main from "./pages/Sun_Main";
import SubMainDetails from "./pages/SubMainDetails";
import Kader from "./pages/Kader";
import Deadline from "./pages/deadline";


function App() {


  return (
    <>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Login />} />

        
        
        <Route
          path="/main"
          element={
            <PrivateRoute>
              <MainTable />
            </PrivateRoute>
          }
        />
        <Route
          path="/sub-main/:mainId"
          element={
            <PrivateRoute>
              <Sub_Main />
            </PrivateRoute>
          }
        />
        <Route
          path="/sub-main/details/:subId"
          element={
            <PrivateRoute>
              <SubMainDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="tasks/:id"
          element={
            <PrivateRoute>
              <Tasks />
            </PrivateRoute>
          }
        />
        <Route
          path="kader/:submainId"
          element={
            <PrivateRoute>
              <Kader />
            </PrivateRoute>
          }
        />
        <Route
          path="deadline/:submainId"
          element={
            <PrivateRoute>
              <Deadline />
            </PrivateRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
