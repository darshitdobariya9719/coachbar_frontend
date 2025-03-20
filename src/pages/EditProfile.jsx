import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import api from "../utils/api";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
});

export default function EditProfile() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });

  const navigate = useNavigate();

  const [profilePic, setProfilePic] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      await api.put("/users/update", data);
      setLoading(false);
      alert("Profile updated successfully!");
    } catch (error) {
      setLoading(false);
      alert(error.response?.data?.message || "Update failed");
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("Please select an image first");
      return;
    }
    const formData = new FormData();
    formData.append("profile", file);

    try {
      const { data } = await api.post("/users/upload-profile-pic", formData);
      // setProfilePic(data.profilePic);
      fetchCurrentUser();
      alert("Profile picture updated successfully!");
    } catch (error) {
      alert("Failed to upload profile picture");
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/users/me");
      setValue("name", res.data.name);
      setValue("email", res.data.email);
      setProfilePic(res.data.profile);
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

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
      <Container maxWidth="sm" sx={{ marginTop: "15vh" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            mb: 10,
          }}>
          <Typography variant="h5">Edit Profile</Typography>
          <Avatar
            src={`${api.defaults.baseURL}/images/${profilePic}`}
            sx={{ width: 100, height: 100 }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="file"
              accept="image/*"
              id="upload-file"
              style={{ display: "none" }} // Hide the default input
              onChange={handleFileChange}
            />
            <label htmlFor="upload-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                color="primary">
                Upload Image
              </Button>
            </label>
          </div>
        </Box>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent background
              zIndex: 10,
            }}>
            <CircularProgress />
          </Box>
        )}
        <form
          onSubmit={handleSubmit((data) => {
            setLoading(true);
            onSubmit(data);
          })}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              {...register("name")}
              value={watch("name") || ""}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              fullWidth
              label="Email"
              {...register("email")}
              value={watch("email") || ""}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled
            />
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </Box>
        </form>
      </Container>
    </Box>
  );
}
