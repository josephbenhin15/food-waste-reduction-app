import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

function Leaderboard() {

  const [users, setUsers] = useState([]);
  const myRef = useRef(null);
  const navigate = useNavigate();

  // 🔥 FETCH USERS
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 🔥 SORT BY POINTS
      data.sort((a, b) => (b.points || 0) - (a.points || 0));

      setUsers(data);
    });

    return () => unsubscribe();
  }, []);

  // 🏆 MEDALS
  const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}.`;
  };

  const currentUser = auth.currentUser;

  // 🔥 AUTO SCROLL TO CURRENT USER
  useEffect(() => {
    if (myRef.current) {
      myRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [users]);

  return (
    <div className="px-10 py-16 text-white">

      <h2 className="text-3xl font-bold mb-8">
        🏆 Leaderboard
      </h2>

      <div className="space-y-4">

        {users.map((user, index) => {

          const isCurrentUser =
            currentUser && user.id === currentUser.uid;

          return (
            <div
              key={user.id}
              ref={isCurrentUser ? myRef : null}
              onClick={() => navigate(`/user/${user.id}`)} // 🔥 CLICKABLE
              className={`cursor-pointer flex justify-between items-center p-4 rounded-xl border backdrop-blur-lg transition-all duration-300 hover:scale-105
              
              ${isCurrentUser
                ? "bg-blue-500/20 border-blue-400 scale-105"
                : index === 0
                ? "bg-yellow-500/10 border-yellow-400"
                : index === 1
                ? "bg-gray-400/10 border-gray-300"
                : index === 2
                ? "bg-orange-500/10 border-orange-400"
                : "bg-white/10 border-white/20"
              }`}
            >
              {/* LEFT */}
              <div className="flex items-center gap-4">

                {/* MEDAL */}
                <span className="text-xl font-bold">
                  {getMedal(index)}
                </span>

                {/* PROFILE IMAGE */}
                <img
                  src={user.photo || "https://i.pravatar.cc/150?img=12"}
                  className="w-10 h-10 rounded-full object-cover"
                />

                {/* NAME */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {user.name || "User"}
                  </span>

                  {/* YOU TAG */}
                  {isCurrentUser && (
                    <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </div>

              </div>

              {/* POINTS */}
              <span className="text-yellow-400 font-bold text-lg">
                {user.points || 0} pts
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Leaderboard;