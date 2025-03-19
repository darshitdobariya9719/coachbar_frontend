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
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useSelector } from "react-redux";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Validation Schema
const schema = yup.object({
  name: yup.string().required("Product name is required"),
  sku: yup.string().required("SKU is required"),
  category: yup.string().required("Category is required"),
  source: yup.string().oneOf(["ADMIN", "USER"]).optional(),
  assignedTo: yup.array().optional(),
  logo: yup.mixed().optional(),
});

export default function EditProduct() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();
  const { id } = useParams(); // Get product ID from URL
  const user = useSelector((state) => state.auth.user);
  const { users } = useSelector((state) => state.user);

  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories
    api
      .get("/products/categories")
      .then((res) => setCategories(res.data.categories));

    // Fetch product details
    api
      .get(`/products/${id}`)
      .then((res) => {
        const product = res.data;
        setValue("name", product.name);
        setValue("sku", product.sku);
        setValue("category", product.category);
        setValue("assignedTo", product.assignedTo);
        setPreview(`${api.defaults.baseURL}/images/${product.logo}`); // Set existing image preview
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load product");
        navigate("/products");
      });
  }, [id, setValue, navigate]);

  // Handle file selection and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("sku", data.sku);
      formData.append("category", data.category);
      formData.append("source", user.role === "admin" ? "ADMIN" : "USER");
      formData.append(
        "assignedTo",
        user.role === "admin"
          ? JSON.stringify(data.assignedTo)
          : JSON.stringify([user._id])
      );

      if (selectedFile) {
        formData.append("logo", selectedFile); // Attach new file if updated
      }

      await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product updated successfully!");
      navigate("/products");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update product");
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          mt: 8,
          minHeight: "90vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ mt: 8, minHeight: "90vh" }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate(-1)} // Navigate back
        startIcon={<ArrowBackIcon />} // Back icon
        sx={{ ml: 2, mt: 2 }} // Add spacing
      >
        Back
      </Button>
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            my: "20px",
          }}>
          <Typography variant="h5">Edit Product</Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={2}
              mt={2}>
              {/* Image Preview */}
              {preview && (
                <Box
                  mt={2}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  border="1px solid #ccc"
                  borderRadius="8px"
                  padding="10px"
                  width="100%"
                  maxWidth="300px">
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "contain",
                      borderRadius: "6px",
                    }}
                  />
                </Box>
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
                <Button
                  variant="contained"
                  component="span"
                  color="primary"
                  sx={{
                    textTransform: "none",
                    fontSize: "16px",
                    padding: "8px 20px",
                  }}>
                  Upload Image
                </Button>
              </label>

              {/* Error Message */}
              {errors.logo && (
                <Typography color="error">{errors.logo.message}</Typography>
              )}
            </Box>
            <TextField
              label="Product Name"
              fullWidth
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="SKU"
              fullWidth
              {...register("sku")}
              error={!!errors.sku}
              helperText={errors.sku?.message}
            />

            {/* Category Selection */}
            <Autocomplete
              freeSolo
              options={categories}
              value={watch("category") || ""}
              onInputChange={(_, newValue) => setValue("category", newValue)}
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

            {/* Assign Users - Admin Only */}
            {user.role === "admin" && (
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  {...register("assignedTo")}
                  multiple
                  defaultValue={watch("assignedTo")}>
                  {users.map((u) => (
                    <MenuItem key={u._id} value={u._id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ width: "100px" }}>
              Update
            </Button>
          </Box>
        </form>
      </Container>
    </Box>
  );
}
