import { Link, useNavigate } from "react-router-dom"
import { firestore } from "../config/firebase"
import { useEffect, useState } from "react"
import "../App.css"

function ChatList() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const currentUserId = localStorage.getItem("uid")
  const nav = useNavigate()

  const getInitials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  const getData = async () => {
    setIsLoading(true)
    const query1 = firestore.collection("conversation").where("SenderId", "==", currentUserId)
    const query2 = firestore.collection("conversation").where("RecieverId", "==", currentUserId)
    try {
      const results = await Promise.all([query1.get(), query2.get()])
      const allDocs = []
      results.forEach((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const existingDoc = allDocs.find(
            (existing) => existing.id === doc.id ||
              (existing.SenderId === doc.data().RecieverId && existing.RecieverId === doc.data().SenderId)
          )
          if (!existingDoc) allDocs.push(doc)
        })
      })
      setUsers(allDocs.map((doc) => doc.data()))
    } catch (error) {
      console.error("Error getting documents:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { getData() }, [])

  const openChat = (index) => {
    localStorage.setItem("currentRoomID", users[index]["roomId"])
    nav("/chatScreen")
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
            <h2 className="list-title">Your friends</h2>
            {!isLoading && <span className="list-count">{users.length} friends</span>}
          </div>

          {isLoading ? (
            <div className="loading"><div className="spinner"></div> Loading friends…</div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🤝</div>
              <p>No friends yet — add some from People tab</p>
            </div>
          ) : (
            users.map((val, index) => {
              const isSender = val.SenderId === currentUserId
              const name = isSender ? val.RecieverName : val.SenderName
              const email = isSender ? val.RecieverEmail : val.SenderEmail
              const image = isSender ? val.RecieverImage : val.SenderImage

              return (
                <div className="user-card" key={index}>
                  <div className="avatar">
                    {image ? <img src={image} alt={name} /> : getInitials(name)}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{name}</div>
                    <div className="user-email">{email}</div>
                  </div>
                  <div className="user-actions">
                    <button className="btn-chat" onClick={() => openChat(index)}>Message</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

export default ChatList
