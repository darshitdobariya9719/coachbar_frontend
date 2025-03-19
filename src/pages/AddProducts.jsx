import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import api from "../utils/api";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Validation Schema
const schema = yup.object({
  name: yup.string().required("Product name is required"),
  sku: yup.string().required("SKU is required"),
  category: yup.string().required("Category is required"),
  source: yup.string().oneOf(["ADMIN", "USER"]).optional(),
  assignedTo: yup.array().optional(),
  logo: yup.mixed().required("Product image is required"), // Image validation
});

export default function AddProduct() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { users } = useSelector((state) => state.user);
  const [categories, setCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");

  // Handle file selection and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    console.log('selectedFile: ', selectedFile);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("sku", data.sku);
      formData.append("category", data.category);
      formData.append("source", user.role === "admin" ? "ADMIN" : "USER");
      formData.append("assignedTo", user.role === "admin" ? JSON.stringify(data.assignedTo) : JSON.stringify([user._id]));
      formData.append("logo", selectedFile); // Attach file


      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product added successfully!");
      window.location.href = "/products";
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product");
    }
  };

  useEffect(() => {
    api.get("/products/categories").then((res) => setCategories(res.data.categories));
  }, []);

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate(-1)} // Navigate back
        startIcon={<ArrowBackIcon />} // Back icon
        sx={{ ml: 2, mt: 2 }} // Add spacing
      >
        Back
      </Button>
      <Container maxWidth="sm" sx={{ marginTop: "10vh" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: "20px" }}>
          <Typography variant="h5">Add Product</Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <TextField label="Product Name" fullWidth {...register("name")} error={!!errors.name} helperText={errors.name?.message} />
            <TextField label="SKU" fullWidth {...register("sku")} error={!!errors.sku} helperText={errors.sku?.message} />

            {/* Category with Suggestions */}
            <Autocomplete
              freeSolo
              options={categories}
              value={categoryInput}
              onInputChange={(_, newValue) => setCategoryInput(newValue)}
              onChange={(_, newValue) => setValue("category", newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  {...register("category")}
                  error={!!errors.category}
                  helperText={errors.category?.message}
                />
              )}
            />

            {/* Assign to Users - Only for Admin */}
            {user.role === "admin" && (
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select {...register("assignedTo")} multiple defaultValue={[]}>
                  {users.map((u) => (
                    <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Upload Image */}
            <input
              type="file"
              accept="image/*"
              {...register("logo")}
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="logo-upload"
            />
            <label htmlFor="logo-upload">
              <Button variant="contained" component="span">
                Upload Image
              </Button>
            </label>
            {errors.logo && <Typography color="error">{errors.logo.message}</Typography>}

            {/* Image Preview */}
            {preview && (
              <Box mt={2}>
                <img src={preview} alt="Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "contain" }} />
              </Box>
            )}

            <Button type="submit" variant="contained" color="primary" sx={{ width: "100px" }}>
              Add
            </Button>
          </Box>
        </form>
      </Container>
    </>
  );
}

