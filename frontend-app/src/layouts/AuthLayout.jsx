import React from "react";
import { Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { motion } from "framer-motion";

const AuthLayout = () => {
  const { setIsSidebarOpen } = useStateContext();
  setIsSidebarOpen(false);

  // Animation variants for the logo and title
  const logoVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        duration: 1,
        stiffness: 200,
        damping: 10,
        mass: 1,
      },
    },
  };

  // Animation variants for the Outlet
  const outletVariants = {
    hidden: { opacity: 0, y: -160 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
        mass: 2, // Mass of the moving object
        duration: 1.2,
      },
    },
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E5E1DA, #FBF9F1)",
        position: "relative",
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={logoVariants}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <img src="/assets/artha.svg" alt="Artha" style={{ height: "50px" }} />
        <span style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
          Artha
        </span>
      </motion.div>
      <motion.div initial="hidden" animate="visible" variants={outletVariants}>
        <Outlet />
      </motion.div>
    </div>
  );
};

export default AuthLayout;
