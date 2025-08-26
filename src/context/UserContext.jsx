import React, { createContext, useContext, useEffect, useState } from "react";
import { authDataContext } from "../auth/AuthProvider";
import axios from "axios";

export const userDataContext = createContext();
function UserContext({ children }) {
  let [userData, setUserData] = useState("");
  let { clearToken, getToken } = useContext(authDataContext);

  const getCurrentUser = async () => {
    try {
      // Get token from localStorage
      const token = getToken();

      if (!token) {
        console.log("No auth token available - cannot get current user");
        setUserData(null);
        return;
      }

      console.log(
        "Using token for authentication:",
        token.substring(0, 15) + "...",
      );

      // Make API request with token in Authorization header
      let result = await axios.get("/api/user/getcurrentuser", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserData(result.data);
      console.log("Current user data:", result.data);
    } catch (error) {
      setUserData(null);
      console.log("Error getting current user:", error);

      // If unauthorized (401), clear token
      if (error.response && error.response.status === 401) {
        clearToken();
      }
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  let value = {
    userData,
    setUserData,
    getCurrentUser,
  };

  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  );
}

export default UserContext;
