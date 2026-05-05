import { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

function ProfileSetup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    year: "",
    mess: "",
    mobile: ""
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ NEW

  // 🔥 AUTO FILL NAME
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.displayName || user.email || ""
      }));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 CLOUDINARY UPLOAD
  const uploadImage = async (file) => {
    if (!file) return "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "campus_upload");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dlpjcbj5/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!data.secure_url) {
        console.log("Upload failed:", data);
        alert("Image upload failed ❌");
        return "";
      }

      return data.secure_url;

    } catch (err) {
      console.log("Upload error:", err);
      alert("Upload error ❌");
      return "";
    }
  };

  // 🔥 SUBMIT
  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Login first");
      return;
    }

    const { name, rollNo, year, mess, mobile } = form;

    if (!name || !rollNo || !year || !mess || !mobile) {
      return alert("All fields are required ❗");
    }

    if (mobile.length !== 10) {
      return alert("Enter valid 10-digit mobile number");
    }

    setLoading(true);

    try {
      // 🔥 upload image
      const imageUrl = await uploadImage(file);

      await setDoc(doc(db, "users", user.uid), {
        name: name || user.email, // ✅ fallback safe
        rollNo,
        year,
        mess,
        mobile,
        email: user.email,
        photo: imageUrl || user.photoURL || "",
        points: 0,
        role: "user", // 🔥 IMPORTANT (admin feature)
        createdAt: new Date()
      });

      alert("✅ Profile saved successfully");
      navigate("/");

    } catch (error) {
      console.log(error);
      alert("Something went wrong ❌");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white">

      <div className="bg-white/10 p-8 rounded-xl w-96 backdrop-blur-lg shadow-lg">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Complete Your Profile
        </h2>

        {/* 🔥 IMAGE PREVIEW */}
        {preview && (
          <img
            src={preview}
            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
          />
        )}

        {/* 🔥 FILE INPUT */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files[0];
            setFile(f);
            if (f) setPreview(URL.createObjectURL(f));
          }}
          className="w-full mb-3 text-white"
        />

        {/* INPUTS */}
        <input
          name="name"
          value={form.name}
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 rounded text-black"
        />

        <input
          name="rollNo"
          placeholder="Roll Number"
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 rounded text-black"
        />

        <input
          name="mobile"
          placeholder="Mobile Number"
          type="number"
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 rounded text-black"
        />

        <select
          name="mess"
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 rounded text-black"
        >
          <option value="">Select Mess</option>
          <option value="A Mess">A Mess</option>
          <option value="B Mess">B Mess</option>
        </select>

        <select
          name="year"
          onChange={handleChange}
          className="w-full mb-4 px-3 py-2 rounded text-black"
        >
          <option value="">Select Year</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>

        {/* 🔥 BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 w-full py-2 rounded-lg font-semibold"
        >
          {loading ? "Saving..." : "Save & Continue"}
        </button>

      </div>
    </div>
  );
}

export default ProfileSetup;