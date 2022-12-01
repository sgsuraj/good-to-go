import React, { useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { database } from "../firebaseConfig";
import '../CSS/Connect.css';
import { useNavigate } from 'react-router-dom';
import def_user from '../images/def_user.jpg';

export let show_people = () => {}

export default function ShowPeople(noti_id){

    const uid = localStorage.getItem("uid")
    const my_saved_email = localStorage.getItem(uid+"email");
    const navig = useNavigate();
    const go_home = !Object.keys(JSON.parse(localStorage.getItem("noti_data_main") === null ? '{}' : localStorage.getItem("noti_data_main"))).includes(noti_id)
    let curr_data = JSON.parse(localStorage.getItem("noti_data_main") === null ? '{}' : localStorage.getItem("noti_data_main"))

    useEffect(() => {
        if(go_home || (noti_id.slice(noti_id.length-7, noti_id.length) !== "connect")){
            navig("/")
        }
    }, [go_home, navig, noti_id])
    

    const set_seen_true = async() => {
        show_people(curr_data)
        // if(true){
        if(curr_data[noti_id].seen !== true){
            curr_data[noti_id].seen = true
            localStorage.setItem("noti_data_main", JSON.stringify(curr_data))
            let new_seen = {}
            new_seen[noti_id] = {
                seen: true
            }
            console.log("done...")
            await setDoc(doc(database, "Notifications", my_saved_email), new_seen, {merge: true})
            console.log("done.......")
        }
    }

    const nav_back = () => {
        navig(-1);
    }

    show_people = async(data) => {
            if(data[noti_id] !== undefined && data[noti_id].people !== undefined && data[noti_id].people.length > 0){
                let main_content_box = document.getElementById("connect_content_div") === null ? document.createElement("div") : document.getElementById("connect_content_div")
                main_content_box.innerHTML = ""

                let the_people_info = {}
                if(data[noti_id].people_info !== undefined){
                    the_people_info = data[noti_id].people_info;
                }
                let the_people = data[noti_id].people
                the_people.reverse()

                console.log(the_people_info)

                for(let one_peep of the_people){
                    let one_noti_box = document.createElement("div")
                    one_noti_box.className = "connect_one_box";

                    let user_info_div_connect = document.createElement("div")
                    user_info_div_connect.className = "connect_user_info_div"

                    let user_img_div = document.createElement("div")
                    user_img_div.className = "connect_user_img_div"

                    let user_img_connect = document.createElement("img")
                    user_img_connect.className = "connect_user_img"
                    user_img_connect.alt = "user"

                    if(the_people_info[one_peep] !== undefined){
                        user_img_connect.src = the_people_info[one_peep]
                    }else{
                        user_img_connect.src = def_user
                    }
                    user_img_connect.onerror = (err) => {
                        user_img_connect.src = def_user;
                    }
                    user_img_div.appendChild(user_img_connect)

                    let connect_user_email_div = document.createElement("div")
                    connect_user_email_div.className = "connect_user_email_div"
                    connect_user_email_div.innerHTML = "<b>"+one_peep+"</b>"

                    user_info_div_connect.appendChild(user_img_div)
                    user_info_div_connect.appendChild(connect_user_email_div)

                    one_noti_box.appendChild(user_info_div_connect)

                    let connect_actions_div = document.createElement("div")
                    connect_actions_div.className = "connect_actions_div"

                    let connect_mail_with_desktop_btn = document.createElement("a")
                    connect_mail_with_desktop_btn.className = "connect_mail_btn"
                    connect_mail_with_desktop_btn.target = "_blank"
                    connect_mail_with_desktop_btn.innerHTML = "Mail with desktop"
                    connect_mail_with_desktop_btn.href = "https://mail.google.com/mail/?view=cm&fs=1&tf=1&to="+one_peep+"&su="+one_peep+", I would like to connect with you for...&body=Hey "+one_peep+", I found your post: http://localhost:3000/post/" + noti_id.slice(0, noti_id.length-7) +" interesting. Can you pass a brief about your post.";

                    let connect_mail_with_phone_btn = document.createElement("a")
                    connect_mail_with_phone_btn.className = "connect_mail_btn"
                    connect_mail_with_phone_btn.innerHTML = "Mail with phone"
                    connect_mail_with_phone_btn.target = "_blank"
                    connect_mail_with_phone_btn.href = "mailto:"+ one_peep +"?subject="+one_peep+" I would like to connect with you for...&body=Hey "+one_peep+", I found your post: http://localhost:3000/post/"+noti_id.slice(0, noti_id.length-7)+" interesting. Could you pass a brief about your post.";        
                    
                    connect_actions_div.appendChild(connect_mail_with_desktop_btn)
                    connect_actions_div.appendChild(connect_mail_with_phone_btn)

                    one_noti_box.appendChild(connect_actions_div)
                    main_content_box.appendChild(one_noti_box)

                }
                
            }
    }

    setTimeout(() => {
        set_seen_true()
    }, 0);

    return(
        <div className="connect_main">
            <div className="connect_body">
                <div className="connect_back_div">
                    <div className="connect_back_icon_div" onClick={nav_back}><i className="fa fa-angle-left" style={{border:"none", fontSize:"30px", padding:"0px 0px 0px 0px", margin:"0px 0px 0px 0px"}}></i>
                    </div>
                    <h5 className="connect_back_title_div">Connection Requests
                    </h5>
                </div>
                <div id="connect_content_div" className="connect_content_div">
                </div>
            </div>
        </div>
    )
}