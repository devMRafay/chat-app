import { useState } from "react"
import { auth, db, firestore, storage } from "../Config/firebase"
import { Link, useNavigate } from "react-router-dom"

function Home () {
    
    const [email, setemail] = useState()
    const [password, setpassword] = useState()
    const [name, setname] = useState()
    const [link, setlink] = useState("")
    const nav = useNavigate()

    const imageUpload = async (e) =>{
        console.log(e.target.files[0])
        var storageRef = storage.ref("image").child(e.target.files[0].name);
        await storageRef.put(e.target.files[0]).then((snapshot)=>{
            console.log('Upload a blob or file!')
            storageRef.getDownloadURL().then((url)=>{
                console.log(url)
                setlink(url)
            }).catch((e)=>{
                console.log(e)
            })
        });
    }

    const signUp = async () => {
        await auth.createUserWithEmailAndPassword(email,password)
        .then(async (user)=>{
            console.log(user)
            console.log(user.user.uid)
            
            var obj = {
                email:email,
                password:password,
                name:name,
                userUid:user.user.uid,
                imageUrl: link
            }

            // await db.ref("users").child(user.user.uid).set(obj)
            await firestore.collection("users").doc(user.user.uid).set(obj)
            .then((snap)=>{
                console.log("add in firestore")
                nav("/login")
            }).catch((e)=>{
                console.log(e)
            })

        }).catch((e)=>{
            console.log(e)
        })
    }
    return( 

        <>
        <h1> Create Account Page </h1>
        <input type="text" placeholder="Enter Name" value={name} onChange={(e)=>setname(e.target.value)}/>
        <input type="email" placeholder="Enter email" value={email} onChange={(e)=>setemail(e.target.value)}/>
        <input type="text" placeholder="Enter password" value={password} onChange={(e)=>setpassword(e.target.value)}/>
        <input type="file" onChange={(e)=>imageUpload(e)} />
        <button onClick={()=>signUp()}>Sign up</button>
        <Link to={"/login"}>Login User</Link>
        </>
    )
}

export default Home;