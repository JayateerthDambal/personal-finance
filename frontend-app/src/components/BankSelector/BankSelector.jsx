import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const BankSelector = ({ openDialog, onClose, onSubmit }) => {
  const [bankName, setBankName] = useState("");
  const banks = [
    "JP Morgan Chase",
    "Wells Fargo",
    "Bank of America",
    "Citibank",
    "Morgan Stanley",
    "U.S. Bancorp",
    "PNC Financial Services",
    "Truist Financial",
    "Charles Schwab Corporation",
    "TD Bank, N.A.",
    "Capital One",
    "The Bank of New York Mellon",
    "State Street Corporation",
    "American Express",
    "Citizens Financial Group",
    "HSBC Bank USA",
    "Barclays",
    "Santader Bank",
    "Royal Bank of Scotland",
    "Lloyds Banking Group",
    "Standard Chartered Bank",
    "UBS Group AG",
    "ING Group",
    "BBVA",
  ];

  const handleBankChange = (event) => {
    setBankName(event.target.value);
  };

  const handleSubmit = () => {
    onSubmit(bankName);
  };

  return (
    <>
      <Dialog open={openDialog}>
        <DialogTitle>Select Your Bank</DialogTitle>

        <DialogContent>
          <FormControl>
            <InputLabel id="bank-select-label">Bank</InputLabel>
            <Select
              labelId="bank-select-label"
              value={bankName}
              onChange={handleBankChange}
              size="large"
            >
              {banks.map((bank) => (
                <MenuItem key={bank} value={bank}>
                  {bank.toLocaleUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default BankSelector;
