import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

function Analytics() {

  const [totalUsers, setTotalUsers] = useState(0);
  const [optOutUsers, setOptOutUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {

      // 🔥 TOTAL USERS
      const usersSnap = await getDocs(collection(db, "users"));
      setTotalUsers(usersSnap.size);

      // 🔥 OPT OUT USERS (UNIQUE)
      const optSnap = await getDocs(collection(db, "optouts"));

      const unique = new Set();

      optSnap.forEach(doc => {
        unique.add(doc.data().userId);
      });

      setOptOutUsers(unique.size);
    };

    fetchData();
  }, []);

  const percentage =
    totalUsers > 0
      ? ((optOutUsers / totalUsers) * 100).toFixed(1)
      : 0;

  return (
    <div className="p-10 text-white">

      <h2 className="text-3xl font-bold mb-8">
        📊 Analytics
      </h2>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white/10 p-6 rounded-xl text-center">
          <h3>Total Users</h3>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </div>

        <div className="bg-white/10 p-6 rounded-xl text-center">
          <h3>Opted-Out Users</h3>
          <p className="text-2xl font-bold">{optOutUsers}</p>
        </div>

        <div className="bg-white/10 p-6 rounded-xl text-center">
          <h3>Opt-out %</h3>
          <p className="text-2xl font-bold text-yellow-400">
            {percentage}%
          </p>
        </div>

      </div>

    </div>
  );
}

export default Analytics; 