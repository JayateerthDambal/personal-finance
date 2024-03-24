import React from "react";
import { TextField, styled } from "@mui/material";

const StyledTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "#6e8efb", // Label color when focused
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "15px", // Rounded borders
    "& fieldset": {
      borderColor: "#a777e3", // Default border color
      transition: "all 0.3s ease", // Smooth transition for border and box-shadow
    },
    "&:hover fieldset": {
      borderColor: "#6e8efb", // Border color on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "#6e8efb", // Border color when focused
      boxShadow: "0 0 5px 2px rgba(110, 142, 251, 0.2)", // Box-shadow when focused
    },
    "&.Mui-error fieldset": {
      borderColor: "#f44336", // Border color on error
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: "15px", // Padding for input text
  },
});

const CustomField = ({ label, id, name, ...props }) => {
  return (
    <StyledTextField
      variant="outlined"
      label={label}
      id={id}
      name={name}
      {...props}
    />
  );
};

export default CustomField;
