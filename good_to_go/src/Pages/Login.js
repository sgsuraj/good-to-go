import React, { useEffect } from 'react';
import '../CSS/Login.css';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { app, database } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useState } from 'react';

function Login() {

    const navigate = useNavigate();

    const uid = localStorage.getItem('uid');
    const [go_home, setgo_home] = useState(false);

    useEffect(() => {
        if(go_home || localStorage.getItem(uid+'user_in') === "y"){
            navigate("/home");
        }
    }, [go_home, navigate, uid])

    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    const login_with_google = () => {
            signInWithPopup(auth, provider)
            .then(async(res) => {
                document.getElementById("l_btn").disabled = true;
                document.getElementById("l_btn").innerHTML = "<i class='fa fa-spinner' style='font-size:22px; margin-right: 40px; margin-left: 40px'></i>"
                let my_email = res.user.email;
                if(my_email.endsWith('@itbhu.ac.in') || my_email.endsWith('@iitbhu.ac.in') || my_email.endsWith('@gmail.com')){
                    const uid = res.user.uid;
                    localStorage.setItem('uid', uid);
                    localStorage.setItem(uid+'user_in', "y");
                    localStorage.setItem(uid+'name', res.user.displayName);
                    localStorage.setItem(uid+'email', my_email);
                    localStorage.setItem(uid+'image', res.user.photoURL);
                    await getDoc(doc(database, "Interests", my_email)).then( async(d) => {
                        if(d.exists()){
                            if(Object.keys(d.data()).includes("interests")){
                                if(Object.keys(d.data()).includes("interests")){
                                    localStorage.setItem("my_inte_arr", JSON.stringify(d.data().interests.length > 0 ? d.data().interests : []))
                                }else{
                                    localStorage.setItem("my_inte_arr", '[]')
                                }
                            }else{
                                await setDoc(doc(database, "Interests", my_email), {
                                    interests: []
                                })
                                localStorage.setItem("my_inte_arr", '[]')
                            }
                        }else{
                            await setDoc(doc(database, "Interests", my_email), {
                                interests: []
                            })
                            localStorage.setItem("my_inte_arr", '[]')
                        }
                        await getDoc(doc(database, "Notifications", my_email)).then( async(d1) => {
                            if(d1.exists()){
                                localStorage.setItem("noti_data_main", JSON.stringify(d1.data()))
                            }else{
                                await setDoc(doc(database, "Notifications", my_email), {})
                                localStorage.setItem("noti_data_main", JSON.stringify({}))
                            }
                        })
                    })
                    setgo_home(true)
                    
                }else{
                    auth.currentUser.delete().then(() => {
                        alert("You can login only with institute id!")
                    })
                    .catch((err) => {
                        alert("An error occurred! Please try again later.")
                    })
                }
            })
    }

    
    return (
        <>
            <div>
                <title>Bootstrap Example</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" />
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
            </div>
            <div className='container my-3'>
                <div className='card'>
                    <h2>Please Note! You are only allowed to log in with BHU email id.</h2><br/>
                    <div className='login_form'>
                        <div className='rem_for_p'>
                            <p><input type="checkbox" name="remember_me" onChange={(e) => {}}/>Remember Me</p>
                        </div>
                        <button type='submit' id='l_btn' className='login_button' onClick={login_with_google}>Login with Institute ID</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login