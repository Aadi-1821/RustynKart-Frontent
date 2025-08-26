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

function AuthProvider({ children }) {
  const serverUrl = "https://rustynkart-backend.onrender.com";

  // Configure axios defaults
  // Configure axios defaults
  axios.defaults.withCredentials = true; // Enable credentials for CORS
  axios.defaults.baseURL = serverUrl;
  axios.defaults.headers.common["Accept"] = "application/json";
  axios.defaults.headers.common["Content-Type"] = "application/json";
  axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

  // Set up axios interceptors for token management
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
        console.log("Adding Authorization header with token");
      }

      // Don't add content-type for FormData
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      // Log the final configuration
      console.log("Request config:", {
        url: config.url,
        method: config.method,
        hasToken: !!config.headers.Authorization,
      });

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Add response interceptor to handle auth errors
  axios.interceptors.response.use(
    (response) => {
      try {
        // Check if there's a token in response body
        if (response.data && response.data.token) {
          const token = response.data.token;
          console.log("Received token in response body");
          localStorage.setItem("authToken", token);
          // Set the token for current axios instance
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
        // Check if there's a token in response headers
        else {
          const authHeader =
            response.headers["authorization"] ||
            response.headers["Authorization"];
          if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            console.log("Received token in Authorization header");
            localStorage.setItem("authToken", token);
            // Set the token for current axios instance
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          }
        }

        // Check for token in cookies (just for debugging)
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          if (cookie.trim().startsWith("token=")) {
            console.log("Token found in cookies");
            break;
          }
        }
      } catch (error) {
        console.error("Error processing auth token:", error);
      }

      return response;
    },
    (error) => {
      console.error("API Error:", error?.response?.data || error.message);

      if (error.response) {
        // Handle specific error status codes
        switch (error.response.status) {
          case 401:
            console.log("Unauthorized access detected, clearing auth token");
            localStorage.removeItem("authToken");
            delete axios.defaults.headers.common["Authorization"];
            break;
          case 403:
            console.log("Forbidden access, permission denied");
            break;
          case 429:
            console.log("Too many requests, please try again later");
            break;
        }
      }
      return Promise.reject(error);
    },
  );

  console.log("Axios configured with baseURL:", serverUrl);
  console.log("withCredentials enabled:", axios.defaults.withCredentials);

  // Try to load token from localStorage on init
  const savedToken = localStorage.getItem("authToken");
  if (savedToken) {
    console.log("Found existing token in localStorage");
    axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
  }

  // Test authentication function
  const testAuth = async () => {
    try {
      const token = getToken();

      if (!token) {
        console.log("No auth token available for testing");
        return { authenticated: false, error: "No authentication token found" };
      }

      // Test if the token is valid
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const authCheck = await axios.get("/api/test-auth", config);
      console.log("Auth check response:", authCheck.data);

      return { authenticated: true, ...authCheck.data };
    } catch (error) {
      console.error("Auth test failed:", error);
      return { authenticated: false, error: error.message };
    }
  };

  // Handle token storage
  const saveToken = (token) => {
    if (token) {
      try {
        localStorage.setItem("authToken", token);
        console.log("Auth token saved to localStorage");

        // Set the token for current axios instance
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // For debugging - check if the token was actually set
        const savedToken = localStorage.getItem("authToken");
        if (savedToken === token) {
          console.log("Token verification successful");
        } else {
          console.warn("Token verification failed");
        }

        return true;
      } catch (error) {
        console.error("Error saving token:", error);
        return false;
      }
    }
    return false;
  };

  const clearToken = () => {
    try {
      localStorage.removeItem("authToken");
      console.log("Auth token removed from localStorage");

      // Remove the token from axios headers
      delete axios.defaults.headers.common["Authorization"];

      // Additional cleanup if needed
      try {
        // Clear token cookie with multiple paths and domains to be sure
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
          window.location.hostname;
        document.cookie =
          "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } catch (e) {
        console.log("Could not clear cookies:", e);
      }

      return true;
    } catch (error) {
      console.error("Error clearing token:", error);
      return false;
    }
  };

  const getToken = () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        // For debugging - check cookies if localStorage is empty
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          if (cookie.trim().startsWith("token=")) {
            console.log("Token found in cookies but not in localStorage");
            break;
          }
        }
      }
      return token || null;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!getToken();
  };

  let value = {
    testAuth,
    saveToken,
    clearToken,
    getToken,
    isAuthenticated,
  };

  return (
    <authDataContext.Provider value={value}>
      {children}
    </authDataContext.Provider>
  );
}

export default AuthProvider;
