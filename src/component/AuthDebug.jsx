import React, { useContext, useEffect, useState } from 'react';
import { authDataContext } from '../context/authContext';
import axios from 'axios';
import { toast } from 'react-toastify';

function AuthDebug() {
  const { serverUrl, getToken, saveToken, clearToken } = useContext(authDataContext);
  const [tokenValue, setTokenValue] = useState('');
  const [cookieValue, setCookieValue] = useState('');
  const [customToken, setCustomToken] = useState('');
  const [testResult, setTestResult] = useState({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    setTokenValue(token || 'No token found in localStorage');

    // Parse cookies
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
    setCookieValue(tokenCookie ? tokenCookie.substring(6) : 'No token cookie found');
  }, []);

  const refreshValues = () => {
    const token = localStorage.getItem('authToken');
    setTokenValue(token || 'No token found in localStorage');

    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
    setCookieValue(tokenCookie ? tokenCookie.substring(6) : 'No token cookie found');

    toast.info('Values refreshed');
  };

  const testAuth = async () => {
    try {
      // Test with token in authorization header
      const config = {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`
        }
      };

      const result = await axios.get('/api/user/getcurrentuser', config);
      setTestResult({
        success: true,
        data: result.data,
        message: 'Authentication successful with token'
      });
      toast.success('Auth test passed!');
    } catch (error) {
      console.error('Auth test failed:', error);
      setTestResult({
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        message: 'Authentication failed'
      });
      toast.error('Auth test failed');
    }
  };

  const saveCustomToken = () => {
    if (customToken) {
      saveToken(customToken);
      toast.success('Custom token saved');
      refreshValues();
    }
  };

  const clearStoredToken = () => {
    clearToken();
    toast.info('Token cleared');
    refreshValues();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg"
        onClick={() => setShowDebug(!showDebug)}
      >
        {showDebug ? 'Hide Debug' : 'Auth Debug'}
      </button>

      {showDebug && (
        <div className="mt-4 bg-gray-800 text-white p-4 rounded-lg shadow-xl w-[500px] max-w-full">
          <h3 className="text-xl font-bold mb-4">Auth Debugging</h3>

          <div className="mb-4">
            <div className="font-semibold mb-1">Token in localStorage:</div>
            <div className="bg-gray-700 p-2 rounded overflow-auto text-xs max-h-[60px]">
              {tokenValue || 'none'}
            </div>
          </div>

          <div className="mb-4">
            <div className="font-semibold mb-1">Token in cookies:</div>
            <div className="bg-gray-700 p-2 rounded overflow-auto text-xs max-h-[60px]">
              {cookieValue || 'none'}
            </div>
          </div>

          <div className="flex space-x-2 mb-4">
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={refreshValues}
            >
              Refresh Values
            </button>

            <button
              className="bg-green-500 text-white px-3 py-1 rounded"
              onClick={testAuth}
            >
              Test Auth
            </button>

            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={clearStoredToken}
            >
              Clear Token
            </button>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Set Custom Token:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                className="flex-1 p-2 rounded text-black text-xs"
                placeholder="Paste JWT token here"
              />
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded"
                onClick={saveCustomToken}
              >
                Save
              </button>
            </div>
          </div>

          {Object.keys(testResult).length > 0 && (
            <div className="mt-4">
              <div className="font-semibold mb-1">Test Result:</div>
              <div className={`bg-gray-700 p-2 rounded overflow-auto text-xs max-h-[100px] ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                <pre>{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AuthDebug;
