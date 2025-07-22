import { createHashRouter } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Users from "../pages/Users";
import CreateForm from "../pages/CreateForm";
import FormBuilderDemo from "../pages/FormBuilderDemo";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import DemoProtectedRoute from "../components/DemoProtectedRoute";

const routes = createHashRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/form-builder-demo",
    element: <DemoProtectedRoute element={<Layout />} />,
    children: [
      {
        index: true,
        element: <FormBuilderDemo />,
      },
    ],
  },
  {
    path: "/app",
    element: <ProtectedRoute element={<Layout />} />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "create-form",
        element: <CreateForm />,
      },
    ],
  },
]);
export default routes;
