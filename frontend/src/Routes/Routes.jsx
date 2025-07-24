import { createHashRouter } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Users from "../pages/Users";
import CreateForm from "../pages/CreateForm";
import FormBuilder from "../pages/FormBuilder";
import FormBuilderDemo from "../pages/FormBuilderDemo";
import Forms from "../pages/Forms";
import FormPreview from "../pages/FormPreview";
import TestFormRoles from "../pages/TestFormRoles";
import ValidationTest from "../components/FormBuilder/ValidationTest";
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
      {
        path: "forms",
        element: <Forms />,
      },
      {
        path: "form-builder/:formId",
        element: <FormBuilder />,
      },
      {
        path: "forms/:formId/preview",
        element: <FormPreview />,
      },
      {
        path: "test-roles",
        element: <TestFormRoles />,
      },
      {
        path: "validation-test",
        element: <ValidationTest />,
      },
    ],
  },
]);
export default routes;
