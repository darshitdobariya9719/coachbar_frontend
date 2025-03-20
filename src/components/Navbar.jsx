import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Menu,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { persistor } from "../redux/store";
import { useMediaQuery, useTheme } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
  if (confirmLogout) {
    dispatch(logout());
    persistor.purge();
    navigate("/login");
  }
  };

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar position="fixed" top="0">
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ display: { xs: "block", sm: "none" } }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Product Management
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div style={{ display: "flex", gap: "15px" }}>
              {user && user?.role === "admin" && (
                <Button color="inherit" component={Link} to="/users">
                  Users
                </Button>
              )}
              {user && (
                <Button color="inherit" component={Link} to="/products">
                  Products
                </Button>
              )}
              {user && (
                <div>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit">
                    <AccountCircle />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}>
                    <MenuItem
                      to="/profile"
                      component={Link}
                      onClick={handleClose}>
                      Profile
                    </MenuItem>
                    <MenuItem
                      to="/password"
                      component={Link}
                      onClick={handleClose}>
                      Update Password
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleLogout();
                        handleClose();
                      }}>
                      Logout
                    </MenuItem>
                  </Menu>
                </div>
              )}
            </div>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={toggleDrawer}>
        <List>
          {user && (
            <>
              {user?.role === "admin" && (
                <ListItem
                  button
                  component={Link}
                  to="/users"
                  onClick={toggleDrawer}>
                  <ListItemText primary="Users" />
                </ListItem>
              )}
              <ListItem
                button
                component={Link}
                to="/products"
                onClick={toggleDrawer}>
                <ListItemText primary="Products" />
              </ListItem>
            </>
          )}
          {user && (
            <>
              <ListItem
                button
                component={Link}
                to="/profile"
                onClick={toggleDrawer}>
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem
                button
                component={Link}
                to="/password"
                onClick={toggleDrawer}>
                <ListItemText primary="Update Password" />
              </ListItem>
              <ListItem
                button
                component={Link}
                to="/login"
                onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
