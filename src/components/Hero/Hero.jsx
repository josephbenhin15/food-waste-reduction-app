import hero from "../../assets/nitwnew copy.png";

import { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  increment,
  collection,
  addDoc,
  getDoc,
  arrayUnion,
  getDocs
} from "firebase/firestore";

import { db, auth } from "../../firebase";
import emailjs from "emailjs-com";

// 🔥 EMAIL CONFIG (REPLACE THESE)
const SERVICE_ID = "service_rzv0mee";
const TEMPLATE_ID = "template_ximgv4r";
const PUBLIC_KEY = "rd1ODi6Ml7nOIauGr";

function Hero() {

  const [issue, setIssue] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showIssueInput, setShowIssueInput] = useState(false);
  const [showMealSelect, setShowMealSelect] = useState(false);
  const [meals, setMeals] = useState([]);

  const [tick, setTick] = useState(0);
  const [emailSentMeals, setEmailSentMeals] = useState({});

  // ⏱ TIMER
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 EMAIL FUNCTION
  const sendEmailReport = (meal, count, details) => {
    emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      { meal, count, details },
      PUBLIC_KEY
    )
    .then(() => console.log(`${meal} email sent ✅`))
    .catch(err => console.error("Email error:", err));
  };

  // 🔥 FETCH DATA
  const fetchOptOutData = async (meal, date) => {
    const snapshot = await getDocs(collection(db, "optouts"));
    let list = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (
  data.date === date &&
  data.meals &&
  data.meals.includes(meal)
) {
        list.push(`${data.name} (${data.rollNo})`);
      }
    });

    return {
      count: list.length,
      details: list.join(", ")
    };
  };

  // 🔥 AUTO EMAIL
  useEffect(() => {
    const check = async () => {
      const today = new Date().toISOString().split("T")[0];
      const mealsList = ["Breakfast", "Lunch", "Dinner"];

      for (let meal of mealsList) {
        const status = getMealTimeStatus(meal);

        if (!status.allowed && !emailSentMeals[meal]) {
          const data = await fetchOptOutData(meal, today);

          sendEmailReport(meal, data.count, data.details);

          setEmailSentMeals(prev => ({ ...prev, [meal]: true }));
        }
      }
    };

    check();
  }, [tick]);

  // 🔥 TIME LOGIC
  const getMealTimeStatus = (meal) => {
    const now = new Date();
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const setTime = (date, h, m) => {
      const d = new Date(date);
      d.setHours(h, m, 0, 0);
      return d;
    };

    let start, end;

    if (meal === "Breakfast") {
      start = setTime(yesterday, 9, 0);
      end = setTime(today, 4,30);
    }

    if (meal === "Lunch") {
      start = setTime(today, 8, 0);
      end = setTime(today, 9, 26);
    }

    if (meal === "Dinner") {
      start = setTime(today, 2, 0);
      end = setTime(today, 5, 0);
    }

    if (now < start) return { allowed: false, text: "Not started" };
    if (now > end) return { allowed: false, text: "Closed ❌" };

    const diff = end - now;
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return { allowed: true, text: `⏳ ${h}h ${m}m ${s}s` };
  };

  const toggleMeal = (meal) => {
    setMeals(prev =>
      prev.includes(meal)
        ? prev.filter(m => m !== meal)
        : [...prev, meal]
    );
  };

  // 🔥 IMAGE UPLOAD
  const uploadImage = async (file) => {
    if (!file) return "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "campus_upload");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dlpjcbj5/image/upload",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      return data.secure_url || "";
    } catch {
      alert("Image upload failed ❌");
      return "";
    }
  };

  // 🔥 REPORT ISSUE
  const handleReport = async () => {
  const user = auth.currentUser;

  if (!user) return alert("Login first");
  if (!issue.trim()) return alert("Enter issue");

  setLoading(true); 

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      setLoading(false);
      return alert("Complete profile first ❗");
    }

    const profile = snap.data();
    const imageUrl = await uploadImage(file);

    await addDoc(collection(db, "issues"), {
      text: issue,
      image: imageUrl,
      userId: user.uid,
      name: user.displayName || user.email || "Anonymous",
      rollNo: profile.rollNo,
      year: profile.year,
      mess: profile.mess,
      createdAt: new Date(),
      likes: 0,
      likedBy: []
    });

    // 🔔 ADD THIS BLOCK (notification)
    await addDoc(collection(db, "notifications"), {
      type: "issue",
      message: issue,
      userId: user.uid,
      userName: user.displayName || user.email,
      createdAt: new Date(),
      read: false
    });

    // 🔔 EMAIL TO ADMIN
await emailjs.send(
  SERVICE_ID,
  TEMPLATE_ID,
  {
    meal: "New Issue Reported",
    count: 1,
    details: issue
  },
  PUBLIC_KEY
);

    alert("✅ Issue submitted");

    setIssue("");
    setFile(null);
    setPreview(null);
    setShowIssueInput(false);

  } catch (err) {
    console.error(err);
    alert("Error submitting issue ❌");
  }

  setLoading(false);
};

  // 🔥 OPT OUT
  const confirmOptOut = async () => {
    if (!window.confirm("Are you sure?")) return;

    const user = auth.currentUser;
    if (!user) return alert("Login first");
    if (meals.length === 0) return alert("Select meals");

    for (let meal of meals) {
      if (!getMealTimeStatus(meal).allowed) {
        return alert(`${meal} closed ❌`);
      }
    }

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return alert("Complete profile first ❗");

    const data = snap.data();
    const today = new Date().toISOString().split("T")[0];

    await addDoc(collection(db, "optouts"), {
      userId: user.uid,
      name: data.name,
      rollNo: data.rollNo,
      year: data.year,
      mess: data.mess,
      meals,
      date: today,
      createdAt: new Date()
    });

    await updateDoc(userRef, {
      points: increment(5),
      optedOutDates: arrayUnion(today)
    });

    alert("✅ Opt-out success");
    setMeals([]);
    setShowMealSelect(false);
  };

  return (
    <div
      className="relative h-[85vh] w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${hero})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 flex flex-col justify-center h-full px-10 text-white max-w-2xl">

        <h1 className="text-5xl font-bold mb-4">
          Help Reduce Food Waste!
        </h1>

        <p className="text-lg mb-6">
          Earn rewards by opting out and reporting issues.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => setShowMealSelect(true)}
            className="bg-blue-600 px-6 py-2 rounded-lg"
          >
            Opt-Out
          </button>

          <button
            onClick={() => setShowIssueInput(!showIssueInput)}
            className="bg-gray-700 px-6 py-2 rounded-lg"
          >
            Report Issue
          </button>
        </div>

        {showIssueInput && (
          <div className="mt-6 flex flex-col gap-3">
            <input
              type="text"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="px-4 py-2 rounded text-black"
              placeholder="Describe issue..."
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files[0];
                setFile(f);
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />

            {preview && <img src={preview} alt="preview" className="w-40 rounded" />}

            <button
              onClick={handleReport}
              disabled={loading}
              className="bg-red-500 px-4 py-2 rounded w-fit"
            >
              {loading ? "Uploading..." : "Submit"}
            </button>
          </div>
        )}
{showMealSelect && (
  <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">

    <div className="bg-gray-900 text-white p-8 rounded-2xl w-96 shadow-2xl border border-white/10">

      <h2 className="text-xl font-bold mb-6 text-center">
        Select Meals 🍽️
      </h2>

      <div className="flex flex-col gap-4">

        {["Breakfast", "Lunch", "Dinner"].map(meal => {
          const status = getMealTimeStatus(meal);

          return (
            <label
              key={meal}
              className={`p-3 rounded-lg transition ${
                status.allowed ? "hover:bg-white/10 cursor-pointer" : "opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={!status.allowed}
                    checked={meals.includes(meal)}
                    onChange={() => toggleMeal(meal)}
                  />
                  <span className="font-medium">{meal}</span>
                </div>

                <span className={`text-sm ${
                  status.allowed ? "text-green-400" : "text-red-400"
                }`}>
                  {status.allowed ? status.text : "Closed ❌"}
                </span>

              </div>
            </label>
          );
        })}

      </div>

      {/* 🔥 BUTTONS */}
      <div className="flex justify-between mt-8">

        <button
          onClick={() => setShowMealSelect(false)}
          className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Cancel
        </button>

        <button
          onClick={confirmOptOut}
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition"
        >
          Confirm
        </button>

      </div>

    </div>

  </div>
)}
        
      </div>
    </div>
  );
}

export default Hero;