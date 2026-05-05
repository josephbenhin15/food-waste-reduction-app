const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// 🔥 EMAIL CONFIG
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "josephdontheboina@gmail.com",
    pass: "jrlp qvmg nsei hpvj", 
  },
}); 

// 🔥 HTTP FUNCTION (FREE PLAN)
exports.sendOptOutReport = functions.https.onRequest(async (req, res) => {
  try {
    const meal = req.query.meal;
    const today = new Date().toISOString().split("T")[0];

    if (!meal) {
      return res.status(400).send("Meal not provided");
    }

    const snapshot = await db
      .collection("optouts")
      .where("date", "==", today)
      .get();

    let list = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.meals && data.meals.includes(meal)) {
        list.push(data);
      }
    });

    const count = list.length;

    const details = list.map(u =>
      `${u.name || "Unknown"} (${u.rollNo || "N/A"})`
    ).join("\n");

    await transporter.sendMail({
      from: "josephdontheboina@gmail.com",
      to: "josephdontheboina@gmail.com",
      subject: `${meal} Opt-Out Report`,
      text: `Total Students: ${count}\n\n${details}`,
    });

    res.send("Email sent ✅");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending email");
  }
});