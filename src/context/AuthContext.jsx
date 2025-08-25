import React from "react";
import { createContext } from "react";
import axios from "axios";
export const authDataContext = createContext();

// Add axios interceptors for debugging
axios.interceptors.request.use(
  (config) => {
    console.log("Request:", config.method, config.url);
    console.log("Request Headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  (response) => {
    console.log("Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("Response Error:", error);
    return Promise.reject(error);
  },
);
function AuthContext({ children }) {
  let serverUrl = "https://rustynkart-backend.onrender.com";

  // Configure axios defaults
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = serverUrl;
  axios.defaults.headers.common["Accept"] = "application/json";
  axios.defaults.headers.common["Content-Type"] = "application/json";

  // Set up axios interceptors for token management
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
        console.log("Adding Authorization header with token");
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Add response interceptor to handle auth errors
  axios.interceptors.response.use(
    (response) => {
      // Check if there's a token in response headers
      const authHeader =
        response.headers["authorization"] || response.headers["Authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        console.log("Received token in Authorization header");
        localStorage.setItem("authToken", token);
      }

      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        console.log("Unauthorized access detected, clearing auth token");
        localStorage.removeItem("authToken");
      }
      return Promise.reject(error);
    },
  );

  console.log("Axios configured with baseURL:", serverUrl);
  console.log("withCredentials enabled:", axios.defaults.withCredentials);

  // Test cookie function
  const testCookie = async () => {
    try {
      // Test setting a cookie
      const response = await axios.get("/api/test-cookie");
      console.log("Test cookie response:", response.data);

      // Test if the cookie was set
      const authCheck = await axios.get("/api/test-auth");
      console.log("Auth check response:", authCheck.data);

      return response.data;
    } catch (error) {
      console.error("Cookie test failed:", error);
      return { error: error.message };
    }
  };

  // Handle token storage
  const saveToken = (token) => {
    if (token) {
      localStorage.setItem("authToken", token);
      console.log("Auth token saved to localStorage");

      // Set the token for current axios instance
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  };

  const clearToken = () => {
    localStorage.removeItem("authToken");
    console.log("Auth token removed from localStorage");

    // Remove the token from axios headers
    delete axios.defaults.headers.common["Authorization"];
  };

  const getToken = () => {
    return localStorage.getItem("authToken");
  };

  let value = {
    serverUrl,
    testCookie,
    saveToken,
    clearToken,
    getToken,
  };

  return (
    <authDataContext.Provider value={value}>
      {children}
    </authDataContext.Provider>
  );
}

export default AuthContext;
