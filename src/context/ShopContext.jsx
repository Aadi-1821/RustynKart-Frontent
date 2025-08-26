import React, { createContext, useContext, useEffect, useState } from "react";
import { authDataContext } from "../auth/AuthProvider";
import axios from "axios";
import { userDataContext } from "./UserContext";
import { toast } from "react-toastify";

export const shopDataContext = createContext();
function ShopContext({ children }) {
  let [products, setProducts] = useState([]);
  let [search, setSearch] = useState("");
  let { userData } = useContext(userDataContext);
  let [showSearch, setShowSearch] = useState(false);
  let { getToken } = useContext(authDataContext);
  let [cartItem, setCartItem] = useState({});
  let [loading, setLoading] = useState(false);
  let currency = "₹";
  let delivery_fee = 40;

  const getProducts = async () => {
    try {
      let result = await axios.get("/api/product/list");
      console.log(result.data);
      setProducts(result.data || []);
    } catch (error) {
      console.log("Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts([]);
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

        // Configure request with authorization
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        console.log("Adding auth token to cart add request");

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
      // Don't try to get cart if no user data
      if (!userData) {
        console.log("No user logged in, skipping cart fetch");
        return;
      }

      // Get token from context
      const token = getToken();

      if (!token) {
        console.log("No token available for cart request");
        return;
      }

      console.log("Adding auth token to get cart request");

      const result = await axios.get("/api/cart/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.data) {
        console.log("Cart data received:", result.data);
        setCartItem(result.data);
      } else {
        console.log("Empty cart data received");
        setCartItem({});
      }
    } catch (error) {
      console.log("Error getting cart:", error);
      setCartItem({}); // Reset cart on error
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

        if (!token) {
          console.log("No token available for update request");
          return;
        }

        // Configure request with authorization
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        console.log("Adding auth token to update cart request");

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
    if (!cartItem || Object.keys(cartItem).length === 0) {
      return 0;
    }

    for (const items in cartItem) {
      if (cartItem[items]) {
        for (const item in cartItem[items]) {
          try {
            if (cartItem[items][item] > 0) {
              totalCount += cartItem[items][item];
            }
          } catch (error) {
            console.log("Error counting item:", items, error);
          }
        }
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    if (
      !cartItem ||
      Object.keys(cartItem).length === 0 ||
      !products ||
      products.length === 0
    ) {
      return 0;
    }

    for (const items in cartItem) {
      let itemInfo = products.find((product) => product._id === items);
      if (itemInfo && itemInfo.price) {
        for (const item in cartItem[items]) {
          try {
            if (cartItem[items][item] > 0) {
              totalAmount += itemInfo.price * cartItem[items][item];
            }
          } catch (error) {
            console.log("Error calculating amount for item:", items, error);
          }
        }
      } else {
        console.log("Product info not found for:", items);
      }
    }
    return totalAmount;
  };

  // Load products on initial mount
  useEffect(() => {
    getProducts();
  }, []);

  // Load cart when user data changes or products are loaded
  useEffect(() => {
    if (userData && userData._id) {
      console.log("User logged in, fetching cart");
      getUserCart();
    } else {
      console.log("No user logged in, resetting cart");
      setCartItem({});
    }
  }, [userData]);

  // Add getUserCart to value object
  useEffect(() => {
    if (products.length > 0 && userData) {
      getUserCart();
    }
  }, [products]);

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
    getUserCart,
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
