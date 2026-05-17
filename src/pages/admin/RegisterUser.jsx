import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UserPlus, Store, User, Mail, Lock, CheckCircle2, Camera, ShieldCheck } from "lucide-react";

export default function RegisterUser() {
  const { registerRetailer, sendRegistrationOtp } = useAuth();
  const [selectedRole, setSelectedRole] = useState("retailer");

  const [shopName, setShopName] = useState("");
  const [proprietor, setProprietor] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [route, setRoute] = useState("Parihar Route");
  const [hasCode, setHasCode] = useState("Yes");
  const [dealerCode, setDealerCode] = useState("");

  const [aadharNumber, setAadharNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [inputOtp, setInputOtp] = useState("");

  const [previews, setPreviews] = useState({
    photo: null,
    aadharFront: null,
    aadharBack: null,
    panCard: null,
    bankCheque: null,
  });

  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length <= 10) setMobile(val);
  };

  const handleAadharChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw.length <= 12) {
      const parts = raw.match(/.{1,4}/g);
      setAadharNumber(parts ? parts.join("-") : raw);
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files;
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setPreviews((prev) => ({ ...prev, [field]: reader.result }));
      };
    }
  };

  const sendOtpVerification = async () => {
    if (!email.includes("@")) {
      window.Swal.fire({
        title: "Error",
        text: "Please enter a valid email address!",
        icon: "error",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    window.Swal.fire({
      title: "Sending Registration Code...",
      allowOutsideClick: false,
      didOpen: () => {
        window.Swal.showLoading();
      },
    });
    const result = await sendRegistrationOtp(email);
    window.Swal.close();

    if (result.success) {
      window.Swal.fire({
        title: "Verification Code Sent",
        text: `Please enter the 6-digit registration code sent to ${email}:`,
        input: "number",
        inputPlaceholder: "Enter 6-Digit OTP",
        showCancelButton: true,
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Verify Identity",
      }).then((swalRes) => {
        if (swalRes.value) {
          setInputOtp(swalRes.value);
          setIsEmailVerified(true);
          window.Swal.fire({
            title: "Verified!",
            text: "Email identity successfully verified.",
            icon: "success",
            confirmButtonColor: "#2563eb",
          });
        }
      });
    } else {
      window.Swal.fire({
        title: "Failed!",
        text: result.message,
        icon: "error",
      });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailVerified) {
      window.Swal.fire({
        title: "Verification Pending!",
        text: "Please verify the Email via OTP before submitting.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    window.Swal.fire({
      title: selectedRole === "admin" ? "Registering Admin Staff..." : "Registering Retailer...",
      text: "Synchronizing network parameters, please wait.",
      allowOutsideClick: false,
      didOpen: () => {
        window.Swal.showLoading();
      },
    });

    const finalCode = hasCode === "Yes" ? dealerCode || "N/A" : "N/A";

    // ⚡ जब रोल एडमिन स्टाफ़ होगा, तो बैकएंड को क्रैश होने से बचाने के लिए फ़्रंटएंड से ही ऑटो-बायपास वैल्यूज़ जाएँगी
    const payloadShopName = selectedRole === "admin" ? `OFFICE_STAFF_${proprietor.toUpperCase().replace(/ /g, "_")}` : shopName;
    const payloadAadhar = selectedRole === "admin" ? `STAFF-AA-${Date.now()}` : aadharNumber.replace(/-/g, "");
    const payloadPan = selectedRole === "admin" ? `STAFF-PA-${Date.now()}` : panNumber;
    const payloadBank = selectedRole === "admin" ? "N/A" : bankName;
    const payloadAcc = selectedRole === "admin" ? "00000000000" : accountNumber;
    const payloadIfsc = selectedRole === "admin" ? "SUDHA000000" : ifscCode;

    const newShopData = {
      shopName: payloadShopName,
      proprietor,
      mobile,
      email,
      password,
      route: selectedRole === "admin" ? "All Routes" : route,
      dealerCode: selectedRole === "admin" ? "STAFF-CODE" : finalCode,
      role: selectedRole,
      aadharNumber: payloadAadhar,
      panNumber: payloadPan,
      bankName: payloadBank,
      accountNumber: payloadAcc,
      ifscCode: payloadIfsc,
      otp: inputOtp,
      previews: {
        photo: null,
        aadharFront: null,
        aadharBack: null,
        panCard: null,
        bankCheque: null,
      },
    };

    // अगर रिटेलर है, तो केवल तभी डाक्यूमेंट्स का बंडल अटैच होगा
    if (selectedRole === "retailer") {
      newShopData.previews = previews;
    }

    const result = await registerRetailer(newShopData);
    window.Swal.close();

    if (result && result.success) {
      window.Swal.fire({
        title: "Registration Successful!",
        text: selectedRole === "admin" ? `👑 Admin Staff '${proprietor}' registered cleanly!` : `🏪 Retailer shop '${shopName}' has been recorded permanently!`,
        icon: "success",
        confirmButtonColor: "#2563eb",
      });
      setShopName("");
      setProprietor("");
      setMobile("");
      setEmail("");
      setPassword("");
      setDealerCode("");
      setAadharNumber("");
      setPanNumber("");
      setBankName("");
      setAccountNumber("");
      setIfscCode("");
      setIsEmailVerified(false);
      setInputOtp("");
      setPreviews({
        photo: null,
        aadharFront: null,
        aadharBack: null,
        panCard: null,
        bankCheque: null,
      });
    }
  };
  return (
    <div className="max-w-5xl mx-auto bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-xs select-none max-h-[calc(100vh-32px)] overflow-y-auto scrollbar-none">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 mb-3 gap-3">
        <div className="flex items-center space-x-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-gray-800">Add New System Account</h2>
            <p className="text-gray-400 text-[11px] mt-0.5">Live Database Connected Onboarding Panel for Staff & Retailers</p>
          </div>
        </div>

        {/* Dynamic Role Switch Segment Selection Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner max-w-xs w-full">
          <button
            type="button"
            onClick={() => {
              setSelectedRole("retailer");
              setIsEmailVerified(false);
              setRoute("Parihar Route");
            }}
            className={`w-1/2 flex items-center justify-center space-x-1 py-1.5 rounded-lg font-black text-[10px] uppercase transition-all duration-150 ${
              selectedRole === "retailer" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Retailer Shop</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole("admin");
              setIsEmailVerified(false);
              setRoute("All Routes");
            }}
            className={`w-1/2 flex items-center justify-center space-x-1 py-1.5 rounded-lg font-black text-[10px] uppercase transition-all duration-150 ${
              selectedRole === "admin" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Staff</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
        {/* Section 1: Basic Credentials Portfolio */}
        <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 space-y-2.5">
          <h3 className="font-bold text-blue-600 text-[11px] uppercase tracking-wider flex items-center gap-1">
            {selectedRole === "admin" ? <ShieldCheck className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
            <span>1. Account Core Parameters ({selectedRole.toUpperCase()})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {selectedRole === "retailer" && (
              <div>
                <label className="block font-bold text-gray-600 mb-0.5">Shop Commercial Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Store className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Maurya Sudha Parlour"
                    className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block font-bold text-gray-600 mb-0.5">{selectedRole === "admin" ? "Staff Full Name" : "Proprietor Name"}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  required
                  value={proprietor}
                  onChange={(e) => setProprietor(e.target.value)}
                  placeholder={selectedRole === "admin" ? "e.g. Rajesh Kumar" : "e.g. Amit Kumar Sharma"}
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-gray-600 mb-0.5">Assigned Distribution Route</label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-xl outline-none font-semibold bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                {selectedRole === "admin" && <option value="All Routes">All Routes</option>}
                <option value="Parihar Route">Parihar Route</option>
                <option value="Sonbarsa Route">Sonbarsa Route</option>
              </select>
            </div>
          </div>

          {selectedRole === "retailer" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center border-t border-gray-100 pt-2">
              <div>
                <label className="block font-bold text-gray-600 mb-0.5">Is Sudha Dealer Code Allocated?</label>
                <div className="flex space-x-5 py-0.5">
                  <label className="flex items-center space-x-1.5 font-semibold text-gray-700 cursor-pointer">
                    <input type="radio" name="hasCode" value="Yes" checked={hasCode === "Yes"} onChange={() => setHasCode("Yes")} className="w-3.5 h-3.5 text-blue-600" />
                    <span>Yes, Code Allocated</span>
                  </label>
                  <label className="flex items-center space-x-1.5 font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="hasCode"
                      value="No"
                      checked={hasCode === "No"}
                      onChange={() => {
                        setHasCode("No");
                        setDealerCode("");
                      }}
                      className="w-3.5 h-3.5 text-blue-600"
                    />
                    <span>No (N/A)</span>
                  </label>
                </div>
              </div>
              <div className={`${hasCode === "No" ? "opacity-40 pointer-events-none" : ""} transition-all`}>
                <label className="block font-bold text-gray-600 mb-0.5">Sudha Dealer Code</label>
                <input
                  type="text"
                  disabled={hasCode === "No"}
                  required={hasCode === "Yes"}
                  value={dealerCode}
                  onChange={(e) => setDealerCode(e.target.value)}
                  placeholder="# e.g. 305831"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-xl outline-none font-mono font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border-t border-gray-100 pt-2">
            <div>
              <label className="block font-bold text-gray-600 mb-0.5">Mobile Number</label>
              <input
                type="text"
                required
                value={mobile}
                onChange={handleMobileChange}
                placeholder="10-Digit Mobile No"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-xl outline-none font-mono font-bold tracking-wider shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-600 mb-0.5">Email Address</label>
              <div className="flex space-x-1.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-xl outline-none font-medium shadow-sm focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={sendOtpVerification}
                  disabled={isEmailVerified}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition shadow-md flex-shrink-0 ${isEmailVerified ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  {isEmailVerified ? "Verified ✓" : "Send OTP"}
                </button>
              </div>
            </div>
            <div>
              <label className="block font-bold text-gray-600 mb-0.5">Create Secure Password</label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. Staff@2026"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-xl outline-none font-medium shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ⚡ Conditional Layout Selector Engine: यह भारी हिस्से केवल Retailer होने पर ही स्क्रीन पर लोड होंगे */}
        {selectedRole === "retailer" && (
          <>
            {/* Section 2: Legal KYC Documents Verification */}
            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 space-y-2">
              <h3 className="font-bold text-blue-600 text-[11px] uppercase tracking-wider">2. Legal KYC Verification</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-600 mb-0.5">Aadhaar Card Number</label>
                  <input
                    type="text"
                    required={selectedRole === "retailer"}
                    value={aadharNumber}
                    onChange={handleAadharChange}
                    placeholder="0000-0000-0000"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-xl outline-none font-mono font-bold tracking-widest shadow-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-600 mb-0.5">PAN Card Number</label>
                  <input
                    type="text"
                    maxLength="10"
                    required={selectedRole === "retailer"}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-xl outline-none font-bold tracking-wider shadow-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
                {[
                  { id: "photo", label: "OWNER PHOTO" },
                  { id: "aadharFront", label: "AADHAAR FRONT" },
                  { id: "aadharBack", label: "AADHAAR BACK" },
                  { id: "panCard", label: "PAN CARD" },
                  { id: "bankCheque", label: "BANK PASBOOK / CHEQUE" },
                ].map((doc) => {
                  const hasData = previews[doc.id] !== null && previews[doc.id] !== undefined;
                  return (
                    <div
                      key={doc.id}
                      className={`border-2 border-dashed rounded-2xl p-1.5 bg-white text-center transition flex flex-col justify-center items-center h-24 relative shadow-sm overflow-hidden ${
                        hasData ? "border-emerald-500 bg-emerald-50/40 font-black" : "border-gray-300 hover:bg-gray-100 hover:border-blue-400"
                      }`}
                    >
                      {!hasData ? (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center">
                          <Camera className="w-4 h-4 text-blue-500 mb-0.5" />
                          <span className="text-[10px] font-black text-slate-600 tracking-tight leading-tight uppercase">{doc.label}</span>
                          <input type="file" accept="image/*" capture="environment" required={selectedRole === "retailer"} onChange={(e) => handleFileChange(e, doc.id)} className="hidden" />
                        </label>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-between p-0.5 relative">
                          <img src={previews[doc.id]} alt="KYC Preview" className="w-full h-14 object-contain rounded-lg border border-gray-200 bg-white" />
                          <span className="text-[8px] font-black text-emerald-800 bg-emerald-200 px-1.5 py-0.5 rounded-md flex items-center justify-center border border-emerald-300 mt-1 uppercase w-full tracking-wide">
                            ✓ Uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviews((prev) => ({
                                ...prev,
                                [doc.id]: null,
                              }))
                            }
                            className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full text-[7px] w-3.5 h-3.5 flex items-center justify-center font-bold shadow z-10"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Settlement Bank Account Information */}
            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 space-y-2">
              <h3 className="font-bold text-blue-600 text-[11px] uppercase tracking-wider">3. Settlement Bank Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-600 mb-0.5">Bank Name</label>
                  <input
                    type="text"
                    required={selectedRole === "retailer"}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Bank Name"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-xl outline-none font-medium shadow-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-600 mb-1.5">Account Number</label>
                  <input
                    type="text"
                    required={selectedRole === "retailer"}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account Number"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-xl outline-none font-medium shadow-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-600 mb-0.5">Bank IFSC Code</label>
                  <input
                    type="text"
                    maxLength="11"
                    required={selectedRole === "retailer"}
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="IFSC Code"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-xl outline-none font-bold tracking-wider shadow-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Dynamic Action Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition duration-150 shadow-lg flex items-center justify-center space-x-2 text-xs"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{selectedRole === "admin" ? "Confirm Admin Staff Registration" : "Confirm Retailer Registration"}</span>
        </button>
      </form>
    </div>
  );
}
