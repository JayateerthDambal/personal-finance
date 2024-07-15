import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  OutlinedInput,
} from "@mui/material";

const CategoryModal = ({ open, handleClose, category, onSave }) => {
  const [name, setName] = useState("");
  const [categoryType, setCategoryType] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setCategoryType(category.category_type);
      setKeywords(category.keywords || []);
    } else {
      resetForm();
    }
  }, [category]);

  const resetForm = () => {
    setName("");
    setCategoryType("");
    setKeywords([]);
  };

  const handleSave = () => {
    const categoryData = {
      id: category ? category.id : null,
      name,
      category_type: categoryType,
      keywords,
    };
    console.log(categoryData);
    onSave(categoryData);
    resetForm();
    handleClose();
  };

  const handleKeywordDelete = (keywordToDelete) => () => {
    setKeywords((keywords) =>
      keywords.filter((keyword) => keyword !== keywordToDelete)
    );
  };

  const handleAddKeyword = () => {
    if (inputKeyword && !keywords.includes(inputKeyword)) {
      setKeywords([...keywords, inputKeyword]);
      setInputKeyword("");
    }
  };

  const handleKeywordKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        {category ? "Edit Category" : "Add New Category"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Category Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Type</InputLabel>
          <Select
            value={categoryType}
            label="Type"
            onChange={(e) => setCategoryType(e.target.value)}
          >
            <MenuItem value="Expenses">Expenses</MenuItem>
            <MenuItem value="Income">Income</MenuItem>
            <MenuItem value="Savings">Savings</MenuItem>
            <MenuItem value="Investments">Investments</MenuItem>
            <MenuItem value="Subscriptions">Subscription</MenuItem>
            <MenuItem value="Taxes">Tax</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Keywords</InputLabel>
          <OutlinedInput
            value={inputKeyword}
            onChange={(e) => setInputKeyword(e.target.value)}
            onKeyPress={handleKeywordKeyPress}
            endAdornment={<Button onClick={handleAddKeyword}>Add</Button>}
          />
        </FormControl>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {keywords.map((keyword, index) => (
            <Chip
              key={index}
              label={keyword}
              onDelete={handleKeywordDelete(keyword)}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave}>{category ? "Update" : "Save"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryModal;
