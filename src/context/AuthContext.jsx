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
  let serverUrl = "http://localhost:8000";

  // Configure axios defaults
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = serverUrl;
  axios.defaults.headers.common["Accept"] = "application/json";
  axios.defaults.headers.common["Content-Type"] = "application/json";

  console.log("Axios configured with baseURL:", serverUrl);
  console.log("withCredentials enabled:", axios.defaults.withCredentials);

  // Test cookie function
  const testCookie = async () => {
    try {
      // Test setting a cookie
      const response = await axios.get("/test-cookie");
      console.log("Test cookie response:", response.data);

      // Test if the cookie was set
      const authCheck = await axios.get("/test-auth");
      console.log("Auth check response:", authCheck.data);

      return response.data;
    } catch (error) {
      console.error("Cookie test failed:", error);
      return { error: error.message };
    }
  };

  let value = {
    serverUrl,
    testCookie,
  };

  return (
    <authDataContext.Provider value={value}>
      {children}
    </authDataContext.Provider>
  );
}

export default AuthContext;
