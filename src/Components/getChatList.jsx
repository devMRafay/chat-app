import { Link, useNavigate } from "react-router-dom";
import { firestore } from "../Config/firebase";
import { useEffect, useState } from "react";
import "../App.css";
import { set } from "firebase/database";

function ChatList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const currentUserId = localStorage.getItem("uid"); // Get current user ID
  const nav = useNavigate();
  // const [allqueryData, setAllQueryData] = useState([])

  const getData = async () => {
    setIsLoading(true); // Set loading state


    const query1 = firestore.collection("conversation").where("SenderId", "==", currentUserId);
    // .get().then((snap)=>{
    //     // console.log(snap)
    //     snap.forEach((doc)=>{
    //       console.log(doc.data())
    //       query1.push(doc.data())
    //     })
    //   })


    const query2 = firestore.collection("conversation").where("RecieverId", "==", currentUserId);
    // .get().then((snap)=>{
    //   // console.log(snap)
    //   snap.forEach((doc)=>{
    //     console.log(doc.data())
    //     query2.push(doc.data())
    //   })
    // });

    // const queryData = [...query1, ...query2]
    // setAllQueryData([...query1, ...query2])
    // setUsers([...query1, ...query2])
    try {
      const results = await Promise.all([query1.get(), query2.get()]);
      const allDocs = [];

      results.forEach((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const existingDoc = allDocs.find(
            (existing) => existing.id === doc.id || // Check for duplicate IDs
              (existing.SenderId === doc.data().RecieverId && existing.RecieverId === doc.data().SenderId) // Check for conversation duplicates
          );

          if (!existingDoc) {
            allDocs.push(doc);
          }
        });
      });

      setUsers(allDocs.map((doc) => doc.data()));
    } catch (error) {
      console.error("Error getting documents:", error);
    } 
    
    finally{
        setIsLoading(false); // Reset loading state
    }


    
  };

  useEffect(() => {
    getData();
  }, []); // Run getData on component mount

  const sendChatPage = (v,i) => {
    // ... your logic to navigate to chat screen
    // localStorage.getItem(users[i]["roomId"]);
    console.log(users[i]["roomId"])
    localStorage.setItem("currentRoomID", users[i]["roomId"])
            // "conversation", 
            // localStorage.setItem("RecieverId", val.SenderId == currentUserId ? val.RecieverId : val.SenderId
            // );
            nav("/chatScreen")
  };

  return (
    <>
      <div className="navbar" style={{ display: "flex", justifyContent: "space-around" }}>
        <Link to={"/user"}>User List Page</Link>
        <Link to={"/Request"}>Request</Link>
        <Link to={"/chatList"}>Friends List</Link>
      </div>

      <h1 style={{ textAlign: "center" }}>Chat Users</h1>

      {isLoading ? 
        <p>Loading chat list...</p>
        : 
          // .
          users.map((val, index)=>{
            return(

              <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px",
                          borderBottom: "1px solid #ccc",
                          margin: "40px",
                        }}
                      >
                        <div>

                          <div><strong>ID:</strong> {val.userId}</div>
                          <div>
                            <strong>Name:</strong>{" "}
                            {val.SenderId == currentUserId
                              ? val.RecieverName
                              : val.SenderName}
                          </div>
                          <div>
                            <strong>Email:</strong>{" "}
                            {val.SenderId == currentUserId
                              ? val.RecieverEmail
                              : val.SenderEmail}
                          </div>
                              


                        </div>

                        <div>
                        
                          <button
                            onClick={() => 
                             sendChatPage(val,index)
                            }
                          >
                            Chat
                          </button>
                        </div>
                      </div>

            )
        }) 
      }
        </>
    
    )  }
    
    export default ChatList;



/* 
import { Link, useNavigate } from "react-router-dom";
import { firestore } from "../Config/firebase";
import { useEffect, useState } from "react";
import "../App.css"
*/

/*
function ChatList() {

    // alert("welcome to chat list page")
    console.log("welcome to chat list page")
    const [users, setUsers] = useState([]);
    const [chatListd, setchatList] = useState([]);
    const [currentUserId, setcurrentUserId] = useState("");
    const nav = useNavigate()
    // The current user's ID
    
    const  getData=async ()=>{
        var userId = localStorage.getItem("uid");
        setcurrentUserId(userId);
        var data = [];
        
        const query1 = firestore.collection("conversation").where("SenderId", "==", currentUserId);
    
        // Query to get users where status is equal to "active"
         const query2 = firestore
          .collection("conversation")
          .where("RecieverId", "==", currentUserId);
    
        // Execute both queries
        await Promise.all([query1.get(), query2.get()])
          .then((results) => {
            const allDocs = [];
    
            results.forEach((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                // Merge results, avoiding duplicates
                if (!allDocs.some((existingDoc) => existingDoc.id == doc.id)) {
                  allDocs.push(doc);
                }
              });
            });
    
            // Process the merged results
            allDocs.forEach((doc) => {
              console.log(doc.id, " => ", doc.data());
              data.push(doc.data());
            });
            setchatList(...data);
          })
          .catch((error) => {
            console.log("Error getting documents: ", error);
          });
        

        setUsers(chatListd);
    }

    console.log("chatlist",chatListd)
    console.log("user",users)
      
    useEffect( () => {
       getData()
      }, []);
    
      const sendChatPage=(val)=>{
        localStorage.setItem("conversation", val.roomId);
        localStorage.setItem("RecieverId", val.SenderId == currentUserId ? val.RecieverId : val.SenderId
        );
        nav("/chatScreen")
    
      }




    return(
        <>
            <div className="navbar" style={{display:"flex",justifyContent:"space-around"}}>
                <Link to={"/user"}>User List  Page</Link>
                <Link to={"/Request"}>Request</Link>
                <Link to={"/chatList"}>Friends List</Link>
            </div>

            <h1 style={{ textAlign: "center" }}>Chat Users</h1>
      {users.map((val, index) => { 
        return(
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px",
            borderBottom: "1px solid #ccc",
            margin: "40px",
          }}
        >
          <div>
            // <div><strong>ID:</strong> {val.userId}</div> 
            <div>
              <strong>Name:</strong>{" "}
              {val.SenderId == currentUserId
                ? val.RecieverName
                : val.SenderName}
            </div>
            <div>
              <strong>Email:</strong>{" "}
              {val.SenderId == currentUserId
                ? val.RecieverEmail
                : val.SenderEmail}
            </div>
          </div>
          <div>
            <button
              onClick={() => {
               sendChatPage(val)
              }}
            >
              Chat
            </button>
          </div>
        </div>
      )})}

        </>
    )
 } */
// export default ChatList;



