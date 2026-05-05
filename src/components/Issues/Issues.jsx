import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  deleteDoc,
  runTransaction
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { FaThumbsUp, FaTrash } from "react-icons/fa";

function Issues() {

  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("latest");

  // 🔥 FETCH ISSUES
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "issues"), (snapshot) => {

      let data = snapshot.docs.map(doc => ({
        id: doc.id,
        likes: 0,
        likedBy: [],
        ...doc.data()
      }));

      if (filter === "likes") {
        data.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      } else {
        data.sort((a, b) =>
          (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
      }

      setIssues(data);
    });

    return () => unsubscribe();
  }, [filter]);

  // 👍 LIKE (FIXED WITH TRANSACTION)
  const handleLike = async (issueId) => {
    const user = auth.currentUser;
    if (!user) return alert("Login first");

    const ref = doc(db, "issues", issueId);

    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);

        if (!snap.exists()) {
          throw new Error("Issue not found");
        }

        const data = snap.data();
        const likedBy = data.likedBy || [];

        // ❌ BLOCK duplicate like
        if (likedBy.includes(user.uid)) {
          alert("❌ You already liked this");
          return;
        }

        // ✅ SAFE UPDATE
        transaction.update(ref, {
          likes: (data.likes || 0) + 1,
          likedBy: [...likedBy, user.uid]
        });
      });

    } catch (err) {
      console.log(err);
    }
  };

  // 🗑 DELETE
  const handleDelete = async (id, ownerId) => {
    const user = auth.currentUser;
    if (!user) return;

    if (user.uid !== ownerId) {
      return alert("Not allowed");
    }

    const confirmDelete = window.confirm("Delete this issue?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "issues", id));
  };

  // 🕒 TIME FORMAT
  const formatTime = (date) => {
    const diff = (new Date() - date) / 1000;

    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + " min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hrs ago";
    return Math.floor(diff / 86400) + " days ago";
  };

  return (
    <div className="px-10 py-16 text-white">

      <h2 className="text-3xl font-bold mb-6">🚨 Reported Issues</h2>

      {/* FILTER */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter("latest")}
          className={`px-4 py-2 rounded ${
            filter === "latest" ? "bg-blue-500" : "bg-gray-600"
          }`}
        >
          Latest
        </button>

        <button
          onClick={() => setFilter("likes")}
          className={`px-4 py-2 rounded ${
            filter === "likes" ? "bg-yellow-500" : "bg-gray-600"
          }`}
        >
          Most Liked
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {issues.map(issue => {

          const user = auth.currentUser;
          const isOwner = user && user.uid === issue.userId;
          const alreadyLiked = issue.likedBy?.includes(user?.uid);

          return (
            <div key={issue.id} className="bg-white/10 p-5 rounded-xl relative">

              {/* IMAGE */}
              {issue.image && issue.image !== "" && (
                <img
                  src={issue.image}
                  className="rounded mb-3 w-full h-40 object-cover"
                />
              )}

              {/* TEXT */}
              <p className="font-semibold">{issue.text}</p>

              {/* USER + TIME */}
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>{issue.name}</span>
                <span>
                  {issue.createdAt &&
                    formatTime(
                      issue.createdAt.toDate
                        ? issue.createdAt.toDate()
                        : new Date(issue.createdAt)
                    )}
                </span>
              </div>

              {/* 👍 LIKE BUTTON */}
              <button
                onClick={() => handleLike(issue.id)}
                disabled={alreadyLiked}
                className={`mt-3 flex items-center gap-2 ${
                  alreadyLiked
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-yellow-400"
                }`}
              >
                <FaThumbsUp />
                {issue.likes || 0}
              </button>

              {/* 🗑 DELETE */}
              {isOwner && (
                <button
                  onClick={() => handleDelete(issue.id, issue.userId)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              )}

            </div>
          );
        })}

      </div>
    </div>
  );
}

export default Issues;