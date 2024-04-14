import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import axios from "axios";
import { getToken } from "../../services/LocalStorageService";

const UploadBankStatementDialog = ({ open, handleClose }) => {
  const [file, setFile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const { access_token } = getToken();
  const [selectedAccount, setSelectedAccount] = useState("");
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  useEffect(() => {
    const fetchBankAccounts = async () => {
      const response = await fetch(`${BACKEND_URL}/get-accounts/`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch");
      return await response.json();
    };
    fetchBankAccounts()
      .then((data) => {
        setAccounts(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [open]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleAccountChange = (event) => {
    setSelectedAccount(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || !selectedAccount) {
      alert("Please select a file and a bank account.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/upload-statement/${selectedAccount}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Upload successful:", response.data);
      handleClose(); // Close dialog after upload
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Upload Bank Statement</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <InputLabel id="bank-account-label">Bank Account</InputLabel>
          <Select
            labelId="bank-account-label"
            id="bank-account-select"
            value={selectedAccount}
            label="Bank Account"
            onChange={handleAccountChange}
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.reference_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          id="file"
          type="file"
          fullWidth
          variant="outlined"
          onChange={handleFileChange}
          inputProps={{ accept: ".csv" }} // Only accept .csv files
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Upload</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadBankStatementDialog;