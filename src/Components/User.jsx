import { useEffect, useState } from "react"
import { db, firestore } from "../Config/firebase"
import { Link, useNavigate } from "react-router-dom"
import "../App.css"

function Users() {
  const [user, setUser] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const nav = useNavigate()

  const getInitials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  const getUser = async () => {
    setLoading(true)
    var userId = localStorage.getItem("uid")
    var data = []
    await firestore.collection("users").where("userUid", "!=", userId).get()
      .then((snap) => snap.forEach((doc) => { data.push(doc.data()) }))
      .catch(console.log)

    var SenderRequest = []
    await firestore.collection("Request").where("SenderId", "==", userId).get()
      .then((snap) => snap.forEach((doc) => SenderRequest.push(doc.data())))

    var RecieverRequest = []
    await firestore.collection("Request").where("RecieverId", "==", userId).get()
      .then((snap) => snap.forEach((doc) => RecieverRequest.push(doc.data())))

    var allRequest = [...SenderRequest, ...RecieverRequest]
    const filterUser = data.filter((u) =>
      !allRequest.some(r =>
        (r.SenderId === userId && r.RecieverId === u.userUid) ||
        (r.SenderId === u.userUid && r.RecieverId === userId)
      )
    )
    setUser(filterUser)
    setLoading(false)
  }

  useEffect(() => { getUser() }, [])

  const sendRequest = async (index) => {
    const realIndex = user.findIndex(u => u === filteredUsers[index])
    var uid = localStorage.getItem("uid")
    var email = localStorage.getItem("email")
    var name = localStorage.getItem("name")
    var image = localStorage.getItem("image")
    var key = db.ref("users").push().key
    var obj = {
      SenderId: uid, SenderEmail: email, SenderName: name, SenderImage: image,
      RecieverId: user[realIndex]["userUid"], RecieverEmail: user[realIndex]["email"],
      RecieverName: user[realIndex]["name"], RecieverImage: user[realIndex]["imageUrl"],
      RequestId: key, RequestStatus: "pending"
    }
    await firestore.collection("Request").doc(key).set(obj)
      .then(() => { user[realIndex]["send_status"] = true; user[realIndex]["RequestId"] = key; setUser([...user]) })
      .catch(alert)
  }

  const cancelRequest = async (index) => {
    const realIndex = user.findIndex(u => u === filteredUsers[index])
    await firestore.collection("Request").doc(user[realIndex]["RequestId"]).delete()
      .then(() => { user[realIndex]["send_status"] = false; user[realIndex]["RequestId"] = ""; setUser([...user]) })
      .catch(console.log)
  }

  const filteredUsers = user.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand">ChatApp</span>
        <div className="navbar-links">
          <Link to="/user">People</Link>
          <Link to="/Request">Requests</Link>
          <Link to="/chatList">Friends</Link>
        </div>
      </nav>

      <div className="page">
        <div className="list-container">
          <div className="list-header">
            <h2 className="list-title">People you may know</h2>
            {!loading && <span className="list-count">{filteredUsers.length} people</span>}
          </div>

          <div className="search-bar">
            <svg viewBox="0 0 24 24" className="search-icon" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div> Loading users…</div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>{search ? `No users found for "${search}"` : "No new users to connect with"}</p>
            </div>
          ) : (
            filteredUsers.map((v, i) => (
              <div className="user-card" key={i}>
                <div className="avatar">
                  {v.imageUrl ? <img src={v.imageUrl} alt={v.name} /> : getInitials(v.name)}
                </div>
                <div className="user-info">
                  <div className="user-name">{v.name}</div>
                  <div className="user-email">{v.email}</div>
                </div>
                <div className="user-actions">
                  {v.send_status
                    ? <button className="btn-cancel" onClick={() => cancelRequest(i)}>Withdraw</button>
                    : <button className="btn-send" onClick={() => sendRequest(i)}>Add friend</button>
                  }
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default Users