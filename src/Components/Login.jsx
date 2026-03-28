import { useState } from "react"
import { auth, firestore } from "../Config/firebase"
import { useNavigate, Link } from "react-router-dom"
import "../App.css"

function Login() {
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const LoginUser = async () => {
    if (!email || !password) return alert("Please fill all fields")
    setLoading(true)
    await auth.signInWithEmailAndPassword(email, password)
      .then(async (user) => {
        await firestore.collection("users").doc(user.user.uid).get()
          .then((snap) => {
            localStorage.setItem("uid", user.user.uid)
            localStorage.setItem("email", email)
            localStorage.setItem("name", snap.data()["name"])
            localStorage.setItem("image", snap.data()["imageUrl"])
            nav("/user")
          }).catch(console.log)
      }).catch((e) => { alert(e.message); setLoading(false) })
  }

  return (
    <div className="page-center">
      <div className="card-auth">
        <div className="auth-logo">💬</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue chatting</p>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setemail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Your password" value={password} onChange={(e) => setpassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && LoginUser()} />
        </div>

        <button className="btn-primary" onClick={LoginUser} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div className="auth-footer">
          Don't have an account? <Link to="/">Create one</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
