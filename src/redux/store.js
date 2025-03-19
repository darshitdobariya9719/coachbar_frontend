import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import authReducer from "./authSlice";
import productReducer from "./productSlice";
import userReducer from "./userSlice";

// Define persist config for auth slice
const authPersistConfig = {
  key: "auth",
  storage,
};

// Define persist config for product slice (if needed)
const productPersistConfig = {
  key: "product",
  storage,
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedProductReducer = persistReducer(productPersistConfig, productReducer);
const persistedUserReducer = persistReducer(productPersistConfig, userReducer);


const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    product: persistedProductReducer,
    user: persistedUserReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

// Persistor
export const persistor = persistStore(store);

export default store;
