import React from "react";
import { Button, styled } from "@mui/material";
import { motion, useAnimation } from "framer-motion";

const StyledButton = styled(Button)({
  // background: "linear-gradient(90deg, ##5f2c82 30%, ##49a09d 90%)",
  border: 0,
  borderRadius: 8,
  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
  color: "white",
  padding: "10px 30px",
  margin: "10px",
  width: "50%",
  alignSelf: "center",
});

const AnimatedButton = ({ children, ...props }) => {
  const controls = useAnimation();

  const handleClick = () => {
    controls
      .start({
        scale: 0.95,
        transition: { duration: 0.2 },
      })
      .then(() => {
        controls.start({ scale: 1 });
      });

    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <StyledButton
      component={motion.button}
      animate={controls}
      onClick={handleClick}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default AnimatedButton;
