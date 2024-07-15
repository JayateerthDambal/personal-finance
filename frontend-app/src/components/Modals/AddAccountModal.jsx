import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";

const AddBankAccountDialog = () => (
  <Dialog open={openAddDialog} onClose={handleToggleAddDialog}>
    <DialogTitle>Add New Bank Account</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        name="reference_name"
        label="Reference Name"
        type="text"
        fullWidth
        variant="outlined"
        value={newAccount.reference_name}
        onChange={handleInputChange}
      />
      <TextField
        margin="dense"
        name="account_type"
        label="Account Type"
        type="text"
        fullWidth
        variant="outlined"
        value={newAccount.account_type}
        onChange={handleInputChange}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={handleToggleAddDialog}>Cancel</Button>
      <Button onClick={handleSubmit}>Add</Button>
    </DialogActions>
  </Dialog>
);
