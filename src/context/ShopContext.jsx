import React, { createContext, useContext, useEffect, useState } from "react";
import { authDataContext } from "./AuthContext.jsx";
import axios from "axios";
import { userDataContext } from "./UserContext";
import { toast } from "react-toastify";

export const shopDataContext = createContext();
function ShopContext({ children }) {
  let [products, setProducts] = useState([]);
  let [search, setSearch] = useState("");
  let { userData } = useContext(userDataContext);
  let [showSearch, setShowSearch] = useState(false);
  let { serverUrl, getToken } = useContext(authDataContext);
  let [cartItem, setCartItem] = useState({});
  let [loading, setLoading] = useState(false);
  let currency = "₹";
  let delivery_fee = 40;

  const getProducts = async () => {
    try {
      let result = await axios.get("/api/product/list");
      console.log(result.data);
      setProducts(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addtoCart = async (itemId, size) => {
    if (!size) {
      console.log("Select Product Size");
      return;
    }

    let cartData = structuredClone(cartItem); // Clone the product

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    setCartItem(cartData);

    if (userData) {
      setLoading(true);
      try {
        // Get token from context
        const token = getToken();

        let config = {
          withCredentials: true,
          headers: {},
        };

        // Add Authorization header if token exists
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("Adding auth token to cart add request");
        }

        let result = await axios.post(
          "/api/cart/add",
          { itemId, size },
          config,
        );
        console.log(result.data);
        toast.success("Product Added");
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
        toast.error("Add Cart Error");
      }
    }
  };

  const getUserCart = async () => {
    try {
      // Get token from context
      const token = getToken();

      let config = {
        withCredentials: true,
        headers: {},
      };

      // Add Authorization header if token exists
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Adding auth token to get cart request");
      }

      const result = await axios.post("/api/cart/get", {}, config);

      setCartItem(result.data);
    } catch (error) {
      console.log("Error getting cart:", error);
    }
  };
  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItem);
    cartData[itemId][size] = quantity;
    setCartItem(cartData);

    if (userData) {
      try {
        // Get token from context
        const token = getToken();

        let config = {
          withCredentials: true,
          headers: {},
        };

        // Add Authorization header if token exists
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("Adding auth token to update cart request");
        }

        await axios.post(
          "/api/cart/update",
          { itemId, size, quantity },
          config,
        );
      } catch (error) {
        console.log(error);
      }
    }
  };
  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItem) {
      for (const item in cartItem[items]) {
        try {
          if (cartItem[items][item] > 0) {
            totalCount += cartItem[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItem) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItem[items]) {
        try {
          if (cartItem[items][item] > 0) {
            totalAmount += itemInfo.price * cartItem[items][item];
          }
        } catch (error) {}
      }
    }
    return totalAmount;
  };

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    getUserCart();
  }, []);

  let value = {
    products,
    currency,
    delivery_fee,
    getProducts,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItem,
    addtoCart,
    getCartCount,
    setCartItem,
    updateQuantity,
    getCartAmount,
    loading,
  };
  return (
    <div>
      <shopDataContext.Provider value={value}>
        {children}
      </shopDataContext.Provider>
    </div>
  );
}

export default ShopContext;
