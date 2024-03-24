import { Navigate, useRoutes } from 'react-router-dom';
import { DashboardLayout } from "./layouts";
import { DashboardPage, LoginPage } from "./pages";
import AuthLayout from './layouts/AuthLayout';
import { getToken } from './services/LocalStorageService';

const Router = () => {
    const { access_token } = getToken();
    const routes = useRoutes([
        {
            path: "/",
            element: <DashboardLayout />,
            children: [
                { element: access_token ? <Navigate to="/app" /> : <Navigate to="/auth/login" />, index: true },
                { path: "app", element: access_token ? <DashboardPage /> : <Navigate to="/auth/login" /> },

            ]
        },
        {
            path: "/auth",
            element: <AuthLayout />,
            children: [
                { element: !access_token ? <Navigate to="/auth/login" /> : <Navigate to="/app" /> },
                { path: "/auth/login", element: !access_token ? <LoginPage /> : <Navigate to="/app" /> }
            ]
        }
    ]);

    return routes
}

export default Router;