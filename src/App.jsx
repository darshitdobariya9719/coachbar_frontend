import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Navbar from "./components/Navbar";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import AddProducts from "./pages/AddProducts";
import EditProduct from "./pages/EditProduct";
import EditProfile from "./pages/EditProfile";

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      {user && <Navbar />}
      <Routes>

        {/* Default Route - Redirect Based on Authentication */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/products" /> : <Navigate to="/login" />
          }
        />

        {/* Public Routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />

        <Route
          path="/users/new"
          element={user ? <Register /> : <Navigate to="/login" />}
        />

        <Route
          path="/users"
          element={user ? <Users /> : <Navigate to="/login" />}
        />

        <Route path="/profile" element={<EditProfile />} />

        {/* Protected Routes (Authenticated Users Only) */}
        <Route
          path="/products"
          element={user ? <Products /> : <Navigate to="/login" />}
        />

        <Route
          path="/products/new"
          element={user ? <AddProducts /> : <Navigate to="/login" />}
        />

        <Route path="/products/edit/:id" element={<EditProduct />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
