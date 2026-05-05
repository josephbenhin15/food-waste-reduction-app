import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function EditProfile() {
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
  const [loading, setLoading] = useState(false);

  // 🔥 LOAD EXISTING DATA
  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setForm(data);
        setPreview(data.photo || null);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 CLOUDINARY UPLOAD (FIXED)
  const uploadImage = async (file) => {
    if (!file) return preview;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "campus_upload"); // ⚠️ check this name

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dlpjcbj5/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      console.log("UPLOAD RESPONSE:", data);

      if (!data.secure_url) {
        alert("❌ Image upload failed");
        return preview;
      }

      return data.secure_url;

    } catch (err) {
      console.log("Upload error:", err);
      return preview;
    }
  };

  // 🔥 UPDATE PROFILE (FIXED)
  const handleUpdate = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Login first");

    setLoading(true);

    try {
      let imageUrl = preview;

      // upload new image if selected
      if (file) {
        imageUrl = await uploadImage(file);
      }

      console.log("FINAL IMAGE:", imageUrl);

      await updateDoc(doc(db, "users", user.uid), {
        name: form.name,
        rollNo: form.rollNo,
        mobile: form.mobile,
        mess: form.mess,
        year: form.year,
        photo: imageUrl || preview
      });

      alert("✅ Profile updated!");
      navigate("/");

    } catch (err) {
      console.log(err);
      alert("❌ Update failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white">

      <div className="bg-white/10 p-8 rounded-xl w-96 backdrop-blur-lg">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Edit Profile
        </h2>

        {/* 🖼 PREVIEW */}
        {preview && (
          <img
            src={preview}
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-white"
          />
        )}

        {/* 📷 FILE INPUT */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files[0];
            setFile(f);
            if (f) setPreview(URL.createObjectURL(f));
          }}
          className="w-full mb-4"
        />

        {/* INPUTS */}
        {["name", "rollNo", "mobile"].map((field) => (
          <input
            key={field}
            name={field}
            value={form[field] || ""}
            placeholder={field}
            onChange={handleChange}
            className="w-full mb-3 px-3 py-2 rounded text-black"
          />
        ))}

        {/* MESS */}
        <select
          name="mess"
          value={form.mess || ""}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 rounded text-black"
        >
          <option value="">Select Mess</option>
          <option value="A Mess">A Mess</option>
          <option value="B Mess">B Mess</option>
        </select>

        {/* YEAR */}
        <select
          name="year"
          value={form.year || ""}
          onChange={handleChange}
          className="w-full mb-4 px-3 py-2 rounded text-black"
        >
          <option value="">Select Year</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>

        {/* SAVE BUTTON */}
        <button
          onClick={handleUpdate}
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold ${
            loading
              ? "bg-gray-500"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

      </div>
    </div>
  );
}

export default EditProfile;