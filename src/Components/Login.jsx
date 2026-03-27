import { useState } from "react"
import { auth, db, firestore } from "../Config/firebase"
import { useNavigate } from "react-router-dom"

function Login () {
    
    const [email, setemail] = useState()
    const [password, setpassword] = useState()
    const [name, setname] = useState()
    const nav = useNavigate()

    const LoginUser = async () => {
        await auth.signInWithEmailAndPassword(email,password)
        .then(async (user)=>{
            console.log(user.user.uid)
            
            await firestore.collection("users").doc(user.user.uid).get()
            .then((snap)=>{
                console.log(snap.data()["name"])
                localStorage.setItem("uid", user.user.uid)
                localStorage.setItem("email", email)
                localStorage.setItem("name", snap.data()["name"])
                localStorage.setItem("image", snap.data()["imageUrl"])
                nav("/user")
                // localStorage.setItem("userdata", JSON.stringify({
                    //     name:snap.data()["name"],
                //     email:email,
                //     uid:user.user.uid
                // }))

            }).catch((e)=>{
                console.log(e)
            })
            alert("login successfully")
            
            
        }).catch((e)=>{
            alert(e.code)
            console.log(e)
        })
    }
    return( 

        <>
        <h1> Login Page </h1>
 
        <input type="email" placeholder="Enter email" value={email} onChange={(e)=>setemail(e.target.value)}/>
        <input type="text" placeholder="Enter password" value={password} onChange={(e)=>setpassword(e.target.value)}/>
        <button onClick={()=>LoginUser()}>Login</button>
        </>
    )
}

export default Login;