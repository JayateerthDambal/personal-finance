import React, { useState, useEffect } from "react";
import { Sidebar, Navbar } from "../components";
import { Box, CssBaseline } from "@mui/material";
import { useStateContext } from "../contexts/ContextProvider";
import { Outlet, useLocation } from "react-router-dom";
import { useTheme } from "@emotion/react";
import { useDispatch, useSelector } from "react-redux";
import { useGetLoggedUserQuery } from "../services/userAuthAPI";
import { setUserToken } from "../features/authSlice";
import { motion } from "framer-motion";
import { getToken } from "../services/LocalStorageService";
const DashboardLayout = ({ children }) => {
  const { pathname } = useLocation();

  const { isSidebarOpen, setIsSidebarOpen, screenSize, setScreenSize } =
    useStateContext();
  const dispatch = useDispatch();
  const { access_token } = getToken();
  const { data, error, isSuccess } = useGetLoggedUserQuery(access_token);
  const theme = useTheme();

  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    if (data) {
      setUserData({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      });
    }
    if (error) {
      console.log("Error fetching user data: ", error);
    }
  }, [pathname, data, isSuccess]);

  useEffect(() => {
    dispatch(setUserToken({ access_token: access_token }));
  }, [access_token, dispatch]);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  useEffect(() => {
    if (screenSize <= 900) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [screenSize]);

  useEffect(() => {
    dispatch(setUserToken({ access_token: access_token }));
  }, [access_token, dispatch]);
  return (
    <>
      <CssBaseline />
      <Box display="flex">
        <Navbar
          onSidebarToggle={handleSidebarToggle}
          isSidebarOpen={isSidebarOpen}
          userData={userData}
        />
        <Sidebar
          open={isSidebarOpen}
          onToggle={handleSidebarToggle}
          userData={userData}
        />
      </Box>
      <Box
        display="flex"
        sx={{
          padding: "10px",
        }}
      >
        <Box
          component="main"
          flexGrow={1}
          p={2}
          sx={{
            marginLeft: isSidebarOpen ? "220px" : "10px",
            marginTop: "70px",
            backgroundColor: theme.palette.background.paper,
            borderRadius: "20px",
            overflow: "auto",
            transition: "margin 0.3s",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 1.2,
              type: "spring",
              stiffness: 100,
              mass: 2,
            }}
          >
            <Outlet />
          </motion.div>
        </Box>
      </Box>
    </>
  );
};

export default DashboardLayout;
