import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const ProductContext = createContext();

// बैकएंड एक्सप्रेस सर्वर का यूआरएल एंडपॉइंट
const API_URL = "http://localhost:5000/api";

export function ProductProvider({ children }) {
  const { user } = useAuth(); // लॉगिन यूजर की स्थिति ट्रैक करने के लिए
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🏪 1. डेटाबेस से सभी लाइव प्रोडक्ट्स और स्टॉक मैट्रिक्स लोड करने का फंक्शन
  const fetchLiveProducts = async () => {
    try {
      setLoading(true);
      // केवल तभी हिट मारना जब यूजर लॉगिन हो (टोकन सुरक्षा कवच के लिए)
      const token = localStorage.getItem("sudha_token");
      if (!token) return;

      const response = await axios.get(`${API_URL}/products`);
      if (response.data && response.data.success) {
        setProducts(response.data.data); // डेटाबेस से आई असली लिस्ट स्टेट में सेव
      }
    } catch (error) {
      console.error("❌ Fetch Products API Error:", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // जब भी यूजर लॉगिन हो, तुरंत डेटाबेस से ताज़ा इन्वेंट्री लोड करना
  useEffect(() => {
    if (user) {
      fetchLiveProducts();
    }
  }, [user]);

  // 🎯 2. नया प्रोडक्ट डेटाबेस में सुरक्षित जोड़ना (Admin Only - List New Product)
  const addNewProduct = async (productData) => {
    try {
      const response = await axios.post(`${API_URL}/products/add`, productData);
      if (response.data && response.data.success) {
        await fetchLiveProducts(); // लिस्ट को मोंगोडीबी से दोबारा ताज़ा (Refresh) करना
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error("❌ Add Product API Error:", error.response?.data?.message || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to sync product with cloud database!",
      };
    }
  };

  // 📈 3. डिपो से आए माल की लाइव आवक स्टॉक बढ़ाना (Admin Only - Depot Inward Invoice Update)
  const updateProductInwardStock = async (productId, additionalInward) => {
    try {
      const response = await axios.put(`${API_URL}/products/update-stock/${productId}`, { additionalInward });
      if (response.data && response.data.success) {
        await fetchLiveProducts(); // डेटाबेस से ताज़ा स्टॉक अपडेट करना
        return { success: true };
      }
    } catch (error) {
      console.error("❌ Update Stock API Error:", error.response?.data?.message || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Stock update failed!",
      };
    }
  };

  // 🗑️ 4. प्रोडक्ट को हमेशा के लिए क्लाउड डेटाबेस से हटाना (Admin Only - Delete Product)
  const removeProductFromCatalog = async (productId) => {
    try {
      const response = await axios.delete(`${API_URL}/products/delete/${productId}`);
      if (response.data && response.data.success) {
        await fetchLiveProducts(); // ताज़ा कैटलॉग लोड करना
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error("❌ Delete Product API Error:", error.response?.data?.message || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete from server cluster!",
      };
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        addNewProduct,
        updateProductInwardStock,
        removeProductFromCatalog,
        refreshInventory: fetchLiveProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}
