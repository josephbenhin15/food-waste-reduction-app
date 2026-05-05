import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

function Admin() {

  const navigate = useNavigate();

  const [optouts, setOptouts] = useState([]);
  const [todayCount, setTodayCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  
  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate("/auth");
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists() || snap.data().role !== "admin") {
        navigate("/"); 
      } else {
        setIsAdmin(true);
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

 
  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = onSnapshot(collection(db, "optouts"), (snapshot) => {

      const data = snapshot.docs.map(doc => doc.data());

      const today = new Date().toISOString().split("T")[0];

      const todayData = data.filter(item => item.date === today);

      setOptouts(todayData);
      setTodayCount(todayData.length);

      console.log("Opt-outs:", todayData.length);

    });

    return () => unsubscribe();

  }, [isAdmin]);

  
  if (loading) {
    return (
      <div className="text-white p-10 text-xl">
        Checking admin access...
      </div>
    );
  }

  return (
    <div className="p-10 text-white">

      <h2 className="text-3xl font-bold mb-6">
        📊 Admin Dashboard
      </h2>

      {/* TOTAL */}
      <div className="bg-blue-500/20 p-4 rounded mb-6">
        <h3 className="text-xl">
          Today's Opt-outs: {todayCount}
        </h3>
      </div>

      {/* LIST */}
      <div className="space-y-3">

        {optouts.map((item, index) => (
          <div key={index} className="bg-white/10 p-4 rounded">

            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-400">{item.rollNo}</p>

            <p className="text-sm">
              🍽 {item.meals.join(", ")}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Admin;