import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

function Rewards() {

  const [points, setPoints] = useState(0);
  const [userRef, setUserRef] = useState(null);

  // 🎁 REWARDS LIST
  const rewards = [
    { id: 1, name: "Free Tea ☕", cost: 50 },
    { id: 2, name: "Free Meal 🍽", cost: 100 },
    { id: 3, name: "Priority Mess Pass 🎟", cost: 150 },
    { id: 4, name: "Special Reward 🎁", cost: 200 }
  ];

  // 🔥 FETCH USER POINTS
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    setUserRef(ref);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setPoints(snap.data().points || 0);
      }
    });

    return () => unsub();
  }, []);

  // 🔥 REDEEM FUNCTION
  const handleRedeem = async (reward) => {
    if (!userRef) return;

    if (points < reward.cost) {
      return alert("❌ Not enough points");
    }

    try {
      await updateDoc(userRef, {
        points: points - reward.cost
      });

      alert(`✅ Redeemed: ${reward.name}`);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="px-10 py-16 text-white">

      <h2 className="text-3xl font-bold mb-6">
        🏆 Rewards Center
      </h2>

      {/* 🔥 POINTS */}
      <div className="mb-8 text-xl">
        Your Points: 
        <span className="text-yellow-400 font-bold ml-2">
          {points}
        </span>
      </div>

      {/* 🎁 REWARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-white/10 p-5 rounded-xl border border-white/20"
          >
            <h3 className="text-lg font-semibold mb-2">
              {reward.name}
            </h3>

            <p className="text-gray-300 mb-4">
              Cost: {reward.cost} pts
            </p>

            <button
              onClick={() => handleRedeem(reward)}
              disabled={points < reward.cost}
              className={`px-4 py-2 rounded 
                ${points >= reward.cost 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-gray-500 cursor-not-allowed"}`}
            >
              Redeem
            </button>
          </div>
        ))}

      </div>

    </div>
  );
}

export default Rewards;