import { useEffect, useState } from "react"
import { db, firestore } from "../config/firebase"
import { Link, useNavigate } from "react-router-dom"
import "../App.css"

function Request() {
  const nav = useNavigate()
  const [RequestData, setRequestData] = useState([])
  const [id, setId] = useState()
  const [loading, setLoading] = useState(true)

  const getInitials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  const getAllRequest = async () => {
    setLoading(true)
    var userId = localStorage.getItem("uid")
    setId(userId)
    var SenderRequest = []
    await firestore.collection("Request").where("SenderId", "==", userId).get()
      .then((snap) => snap.forEach((doc) => SenderRequest.push(doc.data())))
    var RecieverRequest = []
    await firestore.collection("Request").where("RecieverId", "==", userId).get()
      .then((snap) => snap.forEach((doc) => RecieverRequest.push(doc.data())))
    setRequestData([...SenderRequest, ...RecieverRequest])
    setLoading(false)
  }

  useEffect(() => { getAllRequest() }, [])

  const AcceptRequest = async (ind) => {
    var userData = RequestData[ind]
    RequestData[ind]["Loading"] = true
    setRequestData([...RequestData])
    var roomId = db.ref("conversation").push().key
    await firestore.collection("conversation").doc(roomId).set({
      SenderId: userData["SenderId"], SenderEmail: userData["SenderEmail"],
      SenderName: userData["SenderName"], SenderImage: userData["SenderImage"],
      RecieverId: userData["RecieverId"], RecieverEmail: userData["RecieverEmail"],
      RecieverName: userData["RecieverName"], RecieverImage: userData["RecieverImage"], roomId
    })
    await firestore.collection("Request").doc(RequestData[ind]["RequestId"]).update({ RequestStatus: "accepted", roomId })
    RequestData[ind]["RequestStatus"] = "accepted"
    RequestData[ind]["roomId"] = roomId
    setRequestData([...RequestData])
  }

  const NavigateToChat = (index) => {
    localStorage.setItem("currentRoomID", RequestData[index]["roomId"])
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
            <h2 className="list-title">Friend requests</h2>
            {!loading && <span className="list-count">{RequestData.length} requests</span>}
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div> Loading requests…</div>
          ) : RequestData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📬</div>
              <p>No friend requests yet</p>
            </div>
          ) : (
            RequestData.map((v, i) => {
              const isSender = v.SenderId === id
              const otherName = isSender ? v.RecieverName : v.SenderName
              const otherEmail = isSender ? v.RecieverEmail : v.SenderEmail
              const otherImage = isSender ? v.RecieverImage : v.SenderImage

              return (
                <div className="user-card" key={i}>
                  <div className="avatar">
                    {otherImage ? <img src={otherImage} alt={otherName} /> : getInitials(otherName)}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{otherName}</div>
                    <div className="user-email">{otherEmail}</div>
                  </div>
                  <div className="user-actions">
                    {isSender && (
                      v.RequestStatus === "pending"
                        ? <span className="badge badge-pending">Pending</span>
                        : <button className="btn-chat" onClick={() => NavigateToChat(i)}>Open chat</button>
                    )}
                    {!isSender && v.RequestStatus === "pending" && (
                      v.Loading
                        ? <span className="badge badge-pending">Accepting…</span>
                        : <button className="btn-accept" onClick={() => AcceptRequest(i)}>Accept</button>
                    )}
                    {!isSender && v.RequestStatus === "accepted" && (
                      <button className="btn-chat" onClick={() => NavigateToChat(i)}>Open chat</button>
                    )}
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

export default Request
