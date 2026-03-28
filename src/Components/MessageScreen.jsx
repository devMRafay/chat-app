import { useEffect, useRef, useState } from "react"
import { db, firestore } from "../Config/firebase"
import { Link, useNavigate } from "react-router-dom"
import "../App.css"

const MessageScreen = () => {
  const [id, setId] = useState("")
  const [roomData, setRoomData] = useState([])
  const [roomID, setRoomId] = useState("")
  const [text, setText] = useState("")
  const [Message, setMessage] = useState([])
  const messagesEndRef = useRef(null)
  const nav = useNavigate()

  var roomId = localStorage.getItem("currentRoomID")

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

  useEffect(() => { getRoomData() }, [])
  useEffect(() => { scrollToBottom() }, [Message])

  const getRoomData = async () => {
    var userId = localStorage.getItem("uid")
    setRoomId(roomId)
    setId(userId)
    var data = []
    await firestore.collection("conversation").doc(roomId).get()
      .then((snap) => { data.push(snap.data()) })
      .catch(console.log)
    setRoomData([...data])
  }

  useEffect(() => {
    const unsubscribe = firestore.collection("message").where("roomId", "==", roomID)
      .onSnapshot((snapshot) => {
        const newMessage = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        newMessage.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        setMessage(newMessage)
      }, console.error)
    return () => unsubscribe()
  }, [id])

  const sendMessage = async () => {
    if (!text.trim() || !roomData[0]) return
    var messageKey = db.ref("message").push().key
    var data = {
      messages: text,
      senderId: id,
      recieverId: roomData[0]["SenderId"] === id ? roomData[0]["RecieverId"] : roomData[0]["SenderId"],
      roomId: roomData[0]["roomId"],
      messageKey,
      timestamp: Date.now()
    }
    setText("")
    await firestore.collection("message").doc(messageKey).set(data).catch(console.log)
  }

  const otherName = roomData[0]
    ? (roomData[0]["SenderId"] === id ? roomData[0]["RecieverName"] : roomData[0]["SenderName"])
    : "Chat"

  const otherImage = roomData[0]
    ? (roomData[0]["SenderId"] === id ? roomData[0]["RecieverImage"] : roomData[0]["SenderImage"])
    : ""

  const getInitials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  const formatTime = (ts) => {
    if (!ts) return ""
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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

      <div className="chat-layout">
        {/* Chat header */}
        <div className="chat-top">
          <button className="back-btn" onClick={() => nav("/chatList")}>
            ← Back
          </button>
          <div className="avatar" style={{ width: 38, height: 38, fontSize: 13 }}>
            {otherImage ? <img src={otherImage} alt={otherName} /> : getInitials(otherName)}
          </div>
          <div className="chat-top-info">
            <div className="chat-top-name">{otherName}</div>
            <div className="chat-top-sub">Active now</div>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-area">
          {Message.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <p>Send a message to start chatting</p>
            </div>
          )}

          {Message.map((v, i) => {
            const isMine = v.senderId === id
            const showDate = i === 0 || (
              Message[i - 1].timestamp &&
              new Date(v.timestamp).toDateString() !== new Date(Message[i - 1].timestamp).toDateString()
            )
            return (
              <div key={v.id}>
                {showDate && v.timestamp && (
                  <div className="date-label">
                    {new Date(v.timestamp).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
                  </div>
                )}
                <div className={`msg-row ${isMine ? "mine" : "theirs"}`} style={{ marginBottom: 2 }}>
                  {!isMine && (
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 10, flexShrink: 0 }}>
                      {otherImage ? <img src={otherImage} alt={otherName} /> : getInitials(otherName)}
                    </div>
                  )}
                  <div>
                    <div className="bubble">{v.messages}</div>
                    <div className="bubble-time">
                      {formatTime(v.timestamp)}
                      {isMine && <span style={{ color: "var(--primary)", marginLeft: 4 }}>✓✓</span>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-bar">
          <div className="input-wrap">
            <textarea
              placeholder="Type a message…"
              value={text}
              rows={1}
              onChange={(e) => {
                setText(e.target.value)
                e.target.style.height = "auto"
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
              }}
            />
          </div>
          <button className="send-btn" onClick={sendMessage}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

export default MessageScreen
