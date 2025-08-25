import React, { useContext, useState } from "react";
import { authDataContext } from "../context/authContext";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TestAuth = () => {
  const { serverUrl, testCookie } = useContext(authDataContext);
  const [cookieTestResult, setCookieTestResult] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [loginResponse, setLoginResponse] = useState(null);

  // Test cookie functionality
  const handleTestCookie = async () => {
    try {
      const result = await testCookie();
      setCookieTestResult(result);
      toast.success("Cookie test completed", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Cookie test error:", error);
      toast.error("Cookie test failed", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Test manual login
  const handleManualLogin = async () => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/auth/login`,
        {
          email: "test@example.com",
          password: "password123",
        },
        { withCredentials: true },
      );
      setLoginResponse(response.data);
      toast.success("Login attempt completed", {
        position: "top-right",
        autoClose: 3000,
      });

      // Check auth status after login
      checkAuthStatus();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${serverUrl}/test-auth`, {
        withCredentials: true,
      });
      setAuthStatus(response.data);
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthStatus({ error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center flex-col p-6">
      <ToastContainer />
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Authentication Debugging
        </h1>

        <div className="space-y-8">
          {/* Test Cookie Section */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">
              Test Cookie Functionality
            </h2>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={handleTestCookie}
            >
              Test Cookies
            </button>

            {cookieTestResult && (
              <div className="mt-4">
                <h3 className="font-medium">Result:</h3>
                <pre className="bg-gray-800 text-green-300 p-3 rounded-md overflow-x-auto mt-2">
                  {JSON.stringify(cookieTestResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Manual Login Section */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Test Manual Login</h2>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              onClick={handleManualLogin}
            >
              Try Login
            </button>

            {loginResponse && (
              <div className="mt-4">
                <h3 className="font-medium">Login Response:</h3>
                <pre className="bg-gray-800 text-green-300 p-3 rounded-md overflow-x-auto mt-2">
                  {JSON.stringify(loginResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Auth Status Section */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">
              Authentication Status
            </h2>
            <button
              className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
              onClick={checkAuthStatus}
            >
              Check Auth Status
            </button>

            {authStatus && (
              <div className="mt-4">
                <h3 className="font-medium">Status:</h3>
                <pre className="bg-gray-800 text-green-300 p-3 rounded-md overflow-x-auto mt-2">
                  {JSON.stringify(authStatus, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Browser Cookie Info */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Note:</strong> HTTP-only cookies cannot be accessed via
              JavaScript. You'll need to check the Application tab in your
              browser's developer tools to view them.
            </p>
            <div className="flex space-x-4">
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                onClick={() => {
                  console.log("Document cookies:", document.cookie);
                  toast.success("Checked document.cookie (see console)", {
                    position: "top-right",
                    autoClose: 3000,
                  });
                }}
              >
                Log document.cookie
              </button>
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                onClick={() => {
                  toast.success(
                    "Check Application > Storage > Cookies in DevTools",
                    {
                      position: "top-right",
                      autoClose: 3000,
                    },
                  );
                }}
              >
                Check DevTools
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;
