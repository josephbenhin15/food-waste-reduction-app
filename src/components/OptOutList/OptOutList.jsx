import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

function OptOutList() { 

  const [data, setData] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "optouts"), (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data());
      setData(list);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-10 text-white">
      <h2 className="text-3xl font-bold mb-6">
        🍽️ Mess Opt-Out List
      </h2>

      <table className="w-full border border-white/20 text-center">
        <thead className="bg-white/10">
          <tr>
            <th>Roll No</th>
            <th>Name</th> 
            <th>Mess</th>
            <th>Year</th>
            <th>Meals</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-t border-white/10">
              <td>{item.rollNo}</td>
              <td>{item.name}</td>
              <td>{item.mess}</td>
              <td>{item.year}</td>
              <td>{item.meals?.join(", ")}</td>
              <td>{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OptOutList;