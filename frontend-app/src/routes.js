import React, { useState, useEffect } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { DashboardLayout } from "./layouts";
import { DashboardPage, LoginPage, UserProfilePage, AccountsPage } from "./pages";
import AuthLayout from './layouts/AuthLayout';
import { getToken } from './services/LocalStorageService';
import { CircularProgress } from "@mui/material";

const isAuthValid = async () => {
    const { access_token } = getToken();
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    if (!access_token) {
        return false; // If access_token is not  present in the local storage then return false.
    }

    try {
        const response = await fetch(`${BACKEND_URL}/verify-token/`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${access_token}`,
            }
        });

        if (response.status === 401 || !response.ok) {
            return false
        }
        return true;
    } catch (error) {
        console.error('Error', error);
        return false;
    }
};

const ProtectedRoute = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const valid = await isAuthValid();

            console.log(valid)
            setIsAuthenticated(valid);
            setIsLoading(false);
        };

        checkToken();
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/auth/login" replace />;
};


const Router = () => {
    const routes = useRoutes([
        // Protected Routes.
        {
            path: "/",
            element: <ProtectedRoute> <DashboardLayout /></ProtectedRoute>,
            children: [
                // { path: "app", element: <DashboardPage /> },
                { path: "", element: <DashboardPage /> },
                { path: "user-profile", element: <UserProfilePage /> },
                { path: "accounts", element: <AccountsPage /> }
            ]
        },
        // Public Routes
        {
            path: "/auth",
            element: <AuthLayout />,
            children: [
                { path: 'login', element: <LoginPage /> }
            ]
        }
    ]);

    return routes
}

export default Router;