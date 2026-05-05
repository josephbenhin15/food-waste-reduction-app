import { useState } from "react";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Auth() {

  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // 🔥 LOGIN / SIGNUP
  const handleAuth = async () => {
    try {
      if (!email || !password) {
        return alert("Enter email & password");
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        navigate("/setup"); // 🔥 go to profile setup
      }

    } catch (err) {
      alert(err.message);
    }
  };

  // 🔥 FORGOT PASSWORD
  const handleForgotPassword = async () => {
    try {
      if (!email) {
        return alert("Enter your email first");
      }

      await sendPasswordResetEmail(auth, email);

      alert("✅ Password reset email sent!");
      setShowForgot(false);

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white">

      <div className="bg-white/10 p-8 rounded-xl w-96">

        <h2 className="text-2xl mb-6 text-center">
          {showForgot ? "Reset Password" : isLogin ? "Login" : "Sign Up"}
        </h2>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded text-black"
        />

        {/* PASSWORD (HIDE IN FORGOT MODE) */}
        {!showForgot && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded text-black"
          />
        )}

        {/* MAIN BUTTON */}
        {!showForgot ? (
          <button
            onClick={handleAuth}
            className="bg-blue-500 w-full py-2 rounded mt-2"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        ) : (
          <button
            onClick={handleForgotPassword}
            className="bg-yellow-500 w-full py-2 rounded mt-2"
          >
            Send Reset Link
          </button>
        )}

        {/* TOGGLES */}
        <div className="text-sm mt-4 text-center space-y-2">

          {!showForgot && (
            <>
              <p
                onClick={() => setIsLogin(!isLogin)}
                className="cursor-pointer text-blue-400"
              >
                {isLogin
                  ? "New user? Sign Up"
                  : "Already have an account? Login"}
              </p>

              <p
                onClick={() => setShowForgot(true)}
                className="cursor-pointer text-yellow-400"
              >
                Forgot Password?
              </p>
            </>
          )}

          {showForgot && (
            <p
              onClick={() => setShowForgot(false)}
              className="cursor-pointer text-blue-400"
            >
              Back to Login
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

export default Auth;