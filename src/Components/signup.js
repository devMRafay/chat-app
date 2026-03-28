import { useState } from "react"
import { auth, db, firestore, storage } from "../config/firebase"
import { Link, useNavigate } from "react-router-dom"
import "../App.css"

function Home() {
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const [name, setname] = useState("")
  const [link, setlink] = useState("")
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const imageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    var storageRef = storage.ref("image").child(file.name)
    await storageRef.put(file).then(() => {
      storageRef.getDownloadURL().then((url) => setlink(url)).catch(console.log)
    })
  }

  const signUp = async () => {
    if (!name || !email || !password) return alert("Please fill all fields")
    setLoading(true)
    await auth.createUserWithEmailAndPassword(email, password)
      .then(async (user) => {
        var obj = { email, password, name, userUid: user.user.uid, imageUrl: link }
        await firestore.collection("users").doc(user.user.uid).set(obj)
          .then(() => nav("/login"))
          .catch(console.log)
      }).catch((e) => { alert(e.message); setLoading(false) })
  }

  return (
    <div className="page-center">
      <div className="card-auth">
        <div className="auth-logo">💬</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join and start chatting with friends</p>

        <div className="form-group">
          <label className="form-label">Full name</label>
          <input className="form-input" type="text" placeholder="Your name" value={name} onChange={(e) => setname(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setemail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Create a password" value={password} onChange={(e) => setpassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Profile photo <span style={{color:'var(--text-3)', fontWeight:400}}>(optional)</span></label>
          <input className="form-input-file" type="file" accept="image/*" onChange={imageUpload} />
        </div>

        <button className="btn-primary" onClick={signUp} disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}

export default Home
