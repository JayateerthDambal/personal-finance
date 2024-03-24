import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileUploadIcon from "@mui/icons-material/FileUpload";

const FileUploadDialog = ({
  open,
  onClose,
  onFileSelect,
  onGoogleDriveSelect,
}) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileSelect(file);
      onClose(); // Close the dialog after file selection
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Upload Bank Statement</DialogTitle>
      <DialogContent>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button
              variant="outlined"
              component="span"
              size="small"
              startIcon={<FileUploadIcon />}
            >
              Local
            </Button>
          </label>
          <Button
            variant="outlined"
            onClick={onGoogleDriveSelect}
            size="small"
            startIcon={<CloudUploadIcon />}
          >
            Google Drive
          </Button>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" size="small">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUploadDialog;
