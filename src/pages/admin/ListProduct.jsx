import React, { useState } from "react";
import { useProducts } from "../../context/ProductContext";
import { PlusCircle, Tag, IndianRupee, FileText, Camera } from "lucide-react";

export default function ListProduct() {
  const { addNewProduct } = useProducts();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Milk");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [productImage, setProductImage] = useState(null);

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price) {
      window.Swal.fire({
        title: "Error",
        text: "Please fill all mandatory parameters!",
        icon: "error",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    window.Swal.fire({
      title: "Listing New Product...",
      text: "Synchronizing network parameters with MongoDB Atlas Cloud...",
      allowOutsideClick: false,
      didOpen: () => {
        window.Swal.showLoading();
      },
    });

    let packSize = 10;
    let unit = "Ltr";
    let packText = "1 Crate (10 Ltr / 20 Pcs)";
    let imageEmoji = "🥛";

    if (category === "Dahi") {
      packSize = 24;
      unit = "Pcs";
      packText = "1 Box (24 Pcs)";
      imageEmoji = "🥣";
    } else if (category === "Lassi") {
      packSize = 24;
      unit = "Pcs";
      packText = "1 Box (24 Pcs)";
      imageEmoji = "🥤";
    } else if (category === "Ghee") {
      packSize = 12;
      unit = "Pcs";
      packText = "1 Carton (12 Pcs)";
      imageEmoji = "⚱️";
    } else if (category === "Sweets") {
      packSize = 20;
      unit = "Pcs";
      packText = "1 Box (20 Pcs)";
      imageEmoji = "🥮";
    }

    const newProductPayload = {
      name,
      category,
      price: parseFloat(price),
      packSize,
      unit,
      packText,
      image: productImage || imageEmoji,
      depotInward: 0, 
      description,
    };

    const result = await addNewProduct(newProductPayload);
    window.Swal.close();

    if (result && result.success) {
      window.Swal.fire({
        title: "Success!",
        text: result.message,
        icon: "success",
        confirmButtonColor: "#2563eb",
      });
      setName("");
      setPrice("");
      setDescription("");
      setProductImage(null);
    } else {
      window.Swal.fire({
        title: "Failed!",
        text: result.message,
        icon: "error",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-xs select-none max-h-[calc(100vh-32px)] overflow-y-auto scrollbar-none">
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-2 mb-3">
        <PlusCircle className="w-5 h-5 text-blue-600" />
        <div>
          <h2 className="text-lg font-bold text-gray-800">List New Product</h2>
          <p className="text-gray-400 text-[11px] mt-0.5">Centralized Cloud Connected Inventory Control Panel</p>
        </div>
      </div>

      <form onSubmit={handleProductSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-bold text-gray-600 mb-0.5">Product Commercial Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Tag className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sudha Smart Milk 300ml"
                className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-600 mb-0.5">Product Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-xl outline-none font-semibold bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="Milk">Milk</option>
              <option value="Dahi">Dahi</option>
              <option value="Paneer">Paneer</option>
              <option value="Ghee">Ghee</option>
              <option value="Drink & Beverages">Drink & Beverages</option>
              <option value="Icecream">Icecream</option>
              <option value="Sweet">Sweet</option>
              <option value="Other product">Other product</option>
            </select>
          </div>
        </div>

        {/* ⚡ ग्रिड लेआउट फिक्स: स्टॉक इनपुट हटाकर प्राइस वाले बॉक्स को पूरा सिंगल कॉलम स्पेस दिया गया */}
        <div className="border-t border-gray-50 pt-2">
          <label className="block font-bold text-gray-600 mb-0.5">Price Per Crate / Box (₹)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <IndianRupee className="w-3.5 h-3.5" />
            </span>
            <input
              type="number"
              required
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-xl outline-none font-bold text-gray-800 shadow-sm"
            />
          </div>
        </div>

        <div className="border-t border-gray-50 pt-2">
          <label className="block font-bold text-gray-600 mb-1">Upload Product Image (Optional)</label>
          <div
            className={`border-2 border-dashed rounded-2xl p-3 bg-white text-center transition flex flex-col justify-center items-center h-28 relative shadow-sm ${productImage ? "border-emerald-500 bg-emerald-50/20" : "border-gray-300 hover:bg-gray-100 hover:border-blue-400"}`}
          >
            {!productImage ? (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center">
                <Camera className="w-5 h-5 text-blue-500 mb-1 animate-pulse" />
                <span className="text-xs font-black text-slate-600 uppercase tracking-tight">Click to select or capture image</span>
                <input type="file" accept="image/*" onChange={handleProductImageChange} className="hidden" />
              </label>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-between p-0.5 relative">
                <img src={productImage} alt="Product Preview" className="max-w-full h-16 object-contain rounded-lg border bg-white px-2" />
                <span className="text-[9px] font-black text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-md flex items-center justify-center border border-emerald-300 mt-1 uppercase tracking-wider">
                  ✓ Product Image Uploaded
                </span>
                <button
                  type="button"
                  onClick={() => setProductImage(null)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full text-[8px] w-4 h-4 flex items-center justify-center font-bold shadow transition"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-50 pt-2">
          <label className="block font-bold text-gray-600 mb-0.5">Product Description / Notes (Optional)</label>
          <div className="relative">
            <span className="absolute top-2 left-3 text-gray-400">
              <FileText className="w-3.5 h-3.5" />
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter nutritional facts, packaging criteria or shelf life notes here..."
              rows="3"
              className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition duration-150 shadow-lg flex items-center justify-center space-x-2 text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Confirm Product Listing</span>
        </button>
      </form>
    </div>
  );
}
