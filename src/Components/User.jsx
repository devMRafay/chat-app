import { useEffect, useState } from "react"
import { db, firestore } from "../Config/firebase"
import { Link, useNavigate } from "react-router-dom"
import "../App.css"

function Users() {
  const [user, setUser] = useState([])
  const [loading, setLoading] = useState(true)
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
    var uid = localStorage.getItem("uid")
    var email = localStorage.getItem("email")
    var name = localStorage.getItem("name")
    var image = localStorage.getItem("image")
    var key = db.ref("users").push().key
    var obj = {
      SenderId: uid, SenderEmail: email, SenderName: name, SenderImage: image,
      RecieverId: user[index]["userUid"], RecieverEmail: user[index]["email"],
      RecieverName: user[index]["name"], RecieverImage: user[index]["imageUrl"],
      RequestId: key, RequestStatus: "pending"
    }
    await firestore.collection("Request").doc(key).set(obj)
      .then(() => { user[index]["send_status"] = true; user[index]["RequestId"] = key; setUser([...user]) })
      .catch(alert)
  }

  const cancelRequest = async (index) => {
    await firestore.collection("Request").doc(user[index]["RequestId"]).delete()
      .then(() => { user[index]["send_status"] = false; user[index]["RequestId"] = ""; setUser([...user]) })
      .catch(console.log)
  }

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
            {!loading && <span className="list-count">{user.length} people</span>}
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div> Loading users…</div>
          ) : user.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>No new users to connect with</p>
            </div>
          ) : (
            user.map((v, i) => (
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
