import React from "react";
import Navbar from "./Navbar";
import '../CSS/All_content.css';
import {getDocs, getFirestore, query, collection, orderBy, limit, doc, getDoc, setDoc, serverTimestamp} from 'firebase/firestore';
import { app, database } from "../firebaseConfig";
import Login from "./Login";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from "react-router-dom";
import { set_it_false, show_new_content } from "../App";
import def_user from '../images/def_user.jpg';
import def_post from "../images/def_post.jpg";

let update_realtime = () => {}

function All_content(){
    const nav_to = useNavigate()
    
    // const auth = getAuth(app);
    const uid = localStorage.getItem('uid');
    const my_saved_email = localStorage.getItem(uid+"email")

    if(localStorage.getItem(uid+"user_in") !== "y"){
        return(Login())
    }

    // onAuthStateChanged(auth, (user) => {
    //     if (user != null) {
    //       localStorage.setItem(uid+'user_in', "y");
    //     } else {
    //       localStorage.removeItem(uid+'user_in');
    //       localStorage.clear()
    //       nav_to("/login")
    //       return
    //     }
    // });

    const db = getFirestore(app);
    const collectionRef = collection(db, "Posts");

    const like_post = async(id, post_data, is_in) => {
        let g = document.getElementById("like"+id) || document.createElement("div");
        if(!is_in){
            g.style.color = "blue"
            g.style.animation = "0.1s liking step-start";
            setTimeout(() => {
                document.getElementById("like"+id).style.animation = "";
            }, 100);
        }else{
            g.style.color = "white"
            g.style.animation = "0.1s liking step-start";
            setTimeout(() => {
                g.style.animation = "";
            }, 100);
        }
        await getDoc(doc(database, 'Posts', id)).then( async(res) => {
            let new_likers = res.data().likers;
            let new_likers_info = res.data().likers_info;
            let new_like = false
            if(new_likers.includes(my_saved_email)){
                new_likers.splice(new_likers.indexOf(my_saved_email), 1)
                delete new_likers_info[my_saved_email]
            }else{
                new_like = true
                new_likers.push(my_saved_email)
                new_likers_info[my_saved_email] = localStorage.getItem(uid+"image")
            }
            post_data.likers = new_likers
            post_data.likers_info = new_likers_info;
            try{
                g.onclick = () => {
                    like_post(id, post_data, new_likers.includes(my_saved_email))
                }
                document.getElementById("likes_link"+id).innerText = new_likers.length.toString()+" likes &"
            }catch{}
            let new_noti_to_save = {}
            if(new_like){
                new_noti_to_save["new"] = (post_data.email === my_saved_email ? false: true)
            }
            new_noti_to_save[id] = {
                type: "like&comment",
                id: id,
                seen: (post_data.email === my_saved_email ? true: false),
                time: serverTimestamp(),
                likers: new_likers,
                image_url: res.data().image,
                likers_info: new_likers_info
            }
            let new_likes_data = res.data()
            new_likes_data.likers = new_likers
            new_likes_data.likers_info = new_likers_info
            await setDoc(doc(database, 'Posts', id), new_likes_data)
            await setDoc(doc(database, 'Notifications', res.data().email), new_noti_to_save, {merge: true})
        })
    }

    var all_posts = []

    const q = query(collectionRef, orderBy("timestamp", "desc"), limit(100));

    const show_content = async(show_new) => {
        if(show_new_content || (localStorage.getItem("pre_data") === null || JSON.parse(localStorage.getItem("pre_data") || '[]').length === 0 || show_new !== false || show_new === undefined)){
            set_it_false()
            await getDocs(q).then( async(res) => {
                console.log("111111111111111111")
                if(res.docs.length > 0){
                    all_posts = []
                    for(let i=0; i<res.docs.length; i++){
                        const d = res.docs[i];
                        console.log("33333333333333333")
                        const post = {
                            "email": d.data().email === undefined ? "" : d.data().email,
                            "timestamp": d.data().timestamp === undefined ? (serverTimestamp()) : d.data().timestamp,
                            "tags": d.data().tags === undefined ? [] : d.data().tags,
                            "comment": d.data().comment === undefined ? "" : d.data().comment,
                            "image_url": d.data().image === undefined ? def_post : d.data().image,
                            "name": d.data().name === undefined ? "Name" : d.data().name,
                            "pic": d.data().pic === undefined ? def_user : d.data().pic,
                            "is_open": d.data().is_open === undefined ? true : d.data().is_open,
                            "likers": d.data().likers === undefined ? [] : d.data().likers,
                            "likers_info": d.data().likers_info === undefined ? {} : d.data().likers_info,
                            "commenters": d.data().commenters === undefined ? [] : d.data().commenters,
                            "commenters_info": d.data().commenters_info === undefined ? {} : d.data().commenters_info
                        }
                        console.log("444444444444444444444444")
                        const id = d.id;
                        all_posts.push([id, post])
                    }
                    localStorage.setItem("pre_data", JSON.stringify(all_posts))
                    localStorage.setItem("pre_docs", JSON.stringify(res.docs))
                    show_posts(all_posts, false);
                }else{
                    localStorage.removeItem("pre_data")
                    localStorage.removeItem("pre_docs")
                    show_empty_feed();
                }
            })
    }
    else{
        show_posts(JSON.parse(localStorage.getItem("pre_data")), true)
        let new_query = query(collectionRef, orderBy("timestamp", "desc"), limit(100));
        await getDocs(new_query).then( async(res) => {
            console.log("2222222222222222222")
            if(res.docs !== JSON.parse(localStorage.getItem("pre_docs"))){
                if(res.docs.length > 0){
                    let pre_def_data = JSON.parse(localStorage.getItem("pre_data"))
                    let pre_def_id = {}
                    for(let ii of pre_def_data){
                        pre_def_id[ii[0]] = 1;
                    }
                    all_posts = []
                    for(let i=0; i<res.docs.length; i++){
                        const d = res.docs[i];
                        console.log("55555555555555")
                        const post = {
                            "email": d.data().email === undefined ? "" : d.data().email,
                            "timestamp": d.data().timestamp === undefined ? (serverTimestamp()) : d.data().timestamp,
                            "tags": d.data().tags === undefined ? [] : d.data().tags,
                            "comment": d.data().comment === undefined ? "" : d.data().comment,
                            "image_url": d.data().image === undefined ? def_post : d.data().image,
                            "name": d.data().name === undefined ? "Name" : d.data().name,
                            "pic": d.data().pic === undefined ? def_user : d.data().pic,
                            "is_open": d.data().is_open === undefined ? true : d.data().is_open,
                            "likers": d.data().likers === undefined ? [] : d.data().likers,
                            "likers_info": d.data().likers_info === undefined ? {} : d.data().likers_info,
                            "commenters": d.data().commenters === undefined ? [] : d.data().commenters,
                            "commenters_info": d.data().commenters_info === undefined ? {} : d.data().commenters_info
                        }
                        console.log("6666666666666666666")
                        const id = d.id;
                        if(pre_def_id[id] !== undefined){
                            all_posts.push([id, post])
                        }
                    }
                    localStorage.setItem("pre_data", JSON.stringify(all_posts))
                    localStorage.setItem("pre_docs", JSON.stringify(res.docs))
                    show_posts(all_posts, true);
                }else{
                    show_empty_feed();
                }
            }
        })
    }
    }

    const show_empty_feed = () => {
        var all_posts_doc = document.getElementById("all_posts");
        all_posts_doc.innerHTML = "Empty feed!"
    }

    const show_likes = async(id, data) => {
        localStorage.setItem("likes_info_data", JSON.stringify(data))
        nav_to("/likes/"+id);
        return
    }

    const show_comment_box = async(id, data) => {
        localStorage.setItem("comments_info_data", JSON.stringify(data))
        nav_to("/comments/"+id)
        return
    }


    const close_open_close_box = () => {
        try{
            localStorage.removeItem("current_selected_post_id")
            document.getElementById("accept_request_alert_main").style.display = "none"
        }catch{}
    }
    

    const accept_the_request = async(id, info) => {
        let acc_btn = document.getElementById("accept_request_button_yes")
        if(acc_btn !== null && acc_btn !== undefined){
            acc_btn.disabled = true
            acc_btn.innerHTML = "<i class='fa fa-spinner' style='font-size:25px'></i>"
        }
        await getDoc(doc(database, "Notifications", info.email)).then( async(res) => {
            let pre_people = []
            let pre_people_info = {}
            if(res.exists()){
                if(res.data()[id+"connect"] !== undefined){
                    pre_people = res.data()[id+"connect"].people === undefined ? [] : res.data()[id+"connect"].people
                    pre_people_info = res.data()[id+"connect"].people_info === undefined ? {} : res.data()[id+"connect"].people_info
                }
            }
            if(!pre_people.includes(my_saved_email)){
                pre_people.push(my_saved_email)
            }else{
                pre_people.splice(pre_people.indexOf(my_saved_email), 1)
                pre_people.push(my_saved_email)
            }
            pre_people_info[my_saved_email] = localStorage.getItem(uid+"image") === null ? def_user : localStorage.getItem(uid+"image")
            let one_new_noti = {}
            one_new_noti["new"] = true
            one_new_noti[id+"connect"] = {
                type: "connect",
                id: id,
                seen: false,
                image_url: info.image_url,
                time: serverTimestamp(),
                people: pre_people,
                people_info: pre_people_info
            }
            await setDoc(doc(database, "Notifications", info.email), one_new_noti, {merge: true})
            acc_btn.innerHTML = "<i class='fa fa-check' style='font-size:20px'></i>"
            acc_btn.disabled = false
            setTimeout(() => {
                acc_btn.innerHTML = "Yes"
            }, 4000);
        })
    }

    const do_not_accept_the_request = () => {
        localStorage.removeItem("current_selected_post_id")
        try{
            document.getElementById("accept_request_alert_main").style.display = "none"
        }catch{}
    }

    const show_open_close = (id, oc_img_url, info_data) => {

        if(info_data.is_open === false){
            alert("Request has been closed!")
            return
        }

        localStorage.setItem("current_selected_post_id", id)
        try{
            let accept_the_request_button_yes = document.getElementById("accept_request_button_yes");
            accept_the_request_button_yes.onclick = () => {accept_the_request(id, info_data)}
            let accept_request_button_no = document.getElementById("accept_request_button_no");
            accept_request_button_no.onclick = do_not_accept_the_request
            let mail_with_desktop = document.getElementById("mail_with_desktop");
            mail_with_desktop.target = "_blank"
            mail_with_desktop.href = "https://mail.google.com/mail/?view=cm&fs=1&tf=1&to="+info_data.email+"&su="+info_data.name+", I would like to connect with you for...&body=Hey "+info_data.name+", I found your post: http://localhost:3000/post/"+id+" interesting. Could you pass a brief about your post.";
            let mail_with_phone = document.getElementById("mail_with_phone");
            mail_with_phone.target = "_blank"
            mail_with_phone.href = "mailto:"+ info_data.email +"?subject="+info_data.name+" I would like to connect with you for...&body=Hey "+info_data.name+", I found your post: http://localhost:3000/post/"+id+" interesting. Could you pass a brief about your post.";
            document.getElementById("accept_request_alert_main").style.display = "flex";
            document.getElementById("accept_request_alert_box").style.width = Math.min(400, document.getElementById("accept_request_alert_main").getBoundingClientRect().width) + "px"
        }catch{}
    }

    const refresh_open_close = async(id) => {
        await getDoc(doc(database, 'Posts', id)).then((res) => {
            try{
                document.getElementById("like"+id).style.color = res.data().likers.includes(my_saved_email) ? "blue" : "white";
                document.getElementById("likes_link"+id).innerText = res.data().likers.length.toString() + " likes &"
            }catch{}
            try{
                document.getElementById("comments_link"+id).innerText = res.data().commenters.length.toString() + " comments"
            }catch{}
            try{
                let oc_btn = document.getElementById("status"+id);
                let is_open_close = res.data().is_open;
                oc_btn.style.backgroundColor = is_open_close ? "greenyellow" : "orange";
                oc_btn.style.color = is_open_close ? "black" : "white";
                oc_btn.innerHTML = is_open_close ? "open" : "Closed"
            }catch{}
            try{
                document.getElementById("exp"+id).className = "fa fa-angle-left"
                document.getElementById("ref_btn"+id).style.padding = "0px 0px 0px 0px"
                document.getElementById("ref_btn"+id).style.width = "0px"
                document.getElementById("ref_btn"+id).innerHTML = "fa fa-refresh"
            }catch{}
        })
    }

    const show_posts = async(result, to_scr) => {

            let all_posts_doc = document.getElementById("all_posts");
            try{
                all_posts_doc.innerHTML = ""
            }catch{}

            result = (result === null ? [] : result)
            result = (result.length === undefined ? [] : result)

            for(let i=0; i<result.length; i++){

                const body = document.createElement('div');
                body.className = 'post';

                const user_data = document.createElement('div');
                user_data.className = 'user_data';

                    const user_img = document.createElement('img');
                    user_img.className="user_img";
                    user_img.id = "user_img"+result[i][0]
                    user_img.src = result[i][1].pic;
                    user_img.alt = "img";
                    user_img.height = "100%";
                    user_img.width = "100%";
                    user_img.onerror = (err) => {
                        user_img.src = def_user;
                    }
                    user_data.appendChild(user_img)

                    const user_info = document.createElement('div');
                    user_info.className = 'user_info';

                        var name_and_email = document.createElement('p');
                        name_and_email.id = "name_and_email"+result[i][0]
                        name_and_email.innerHTML = ( result[i][1].name !== undefined ? (result[i][1].name.length > 30 ? result[i][1].name.slice(0, 30)+"..." : result[i][1].name) : "Name") + "<br/>" + (result[i][1].email !== undefined ? result[i][1].email : "Email");
                        user_info.appendChild(name_and_email);
                    
                    user_data.appendChild(user_info)
                
                    body.appendChild(user_data)

                const img_place = document.createElement('div')
                img_place.className = 'img_place';

                    const img_style = document.createElement('img');
                    img_style.className = 'img_style';
                    img_style.src = result[i][1].image_url;
                    img_style.alt = "img";
                    img_style.onerror = (err) => {
                        img_style.src = def_post;
                        img_style.style.opacity = "0.2"
                    }
                    img_place.appendChild(img_style);

                body.appendChild(img_place);

                const post_data = document.createElement('div');
                post_data.className = 'post_data';

                    const functions = document.createElement('div');
                    functions.className = 'functions';

                        const env1 = document.createElement('div');
                        env1.className = 'separator';

                            const b1 = document.createElement('i')
                            b1.className = 'fa fa-thumbs-up';
                            b1.id = "like"+result[i][0];
                            try{
                                if(result[i][1].likers !== undefined && result[i][1].likers.includes(my_saved_email)){
                                    b1.style.color = "blue";
                                }else{
                                    b1.style.color = "white"
                                }
                            }catch{}
                            b1.onclick = () => { like_post(result[i][0], result[i][1], result[i][1].likers.includes(my_saved_email)) }
                            env1.appendChild(b1);
                        functions.appendChild(env1)
                        
                        const env2 = document.createElement('div');
                        env2.className = 'separator';

                            const b2 = document.createElement('i')
                            b2.className = 'fa fa-comment';
                            b2.onclick = () => {show_comment_box(result[i][0], result[i][1])}
                            env2.appendChild(b2);

                        functions.appendChild(env2);
                        
                        const env3 = document.createElement('div');
                        env3.className = 'separator1';

                            const ref_btn = document.createElement("button")
                            ref_btn.className = "ref_btn_class"
                            ref_btn.id = "ref_btn"+result[i][0]
                            ref_btn.innerHTML = "<i class='fa fa-refresh'></i>"
                            ref_btn.onclick = () => {
                                ref_btn.innerHTML = "<i class='fa fa-spinner'></i>"
                                refresh_open_close(result[i][0])
                            }

                            const expend_btn = document.createElement("button")
                            expend_btn.className = "fa fa-angle-left"
                            expend_btn.style.margin = "0px 0px 0px 0px"
                            expend_btn.style.padding = "0px 10px 0px 10px"
                            expend_btn.style.backgroundColor = "whitesmoke"
                            expend_btn.style.fontSize = "18px"
                            expend_btn.id = "exp"+result[i][0]
                            expend_btn.onclick = () => {
                                if(ref_btn.getBoundingClientRect().width === 0){
                                    expend_btn.className = "fa fa-angle-right"
                                    ref_btn.style.width = "fit-content"
                                    ref_btn.innerHTML = "<i class='fa fa-refresh'></i>"
                                    ref_btn.style.padding = "0px 10px 0px 0px"
                                }else{
                                    expend_btn.className = "fa fa-angle-left"
                                    ref_btn.style.padding = "0px 0px 0px 0px"
                                    ref_btn.innerHTML = ""
                                    ref_btn.style.width = "0px"
                                }
                            }

                            const b3 = document.createElement('button')
                            b3.className = "open_close_btn"
                            b3.id = "status"+result[i][0];

                            let req_open = result[i][1].is_open === undefined ? true : result[i][1].is_open;

                            if(req_open){
                                b3.innerHTML += "Open"
                                b3.style.backgroundColor = "greenyellow";
                                b3.style.color = "black";
                            }else{
                                b3.style.backgroundColor = "orange";
                                b3.style.color = "white";
                                b3.innerHTML = "Closed"
                            }
                            b3.onclick = () => {localStorage.setItem("open_close_id", result[i][0]); show_open_close(result[i][0], result[i][1].image_url === undefined ? def_post : result[i][1].image_url, result[i][1])}

                            env3.appendChild(expend_btn)
                            env3.appendChild(ref_btn)
                            env3.appendChild(b3);

                        if(result[i][1].email !== my_saved_email){
                            functions.appendChild(env3)
                        }

                    post_data.appendChild(functions);

                    let likes_and_comments_div = document.createElement("div")
                    likes_and_comments_div.className = "l_and_c_div"

                    let num_likes_div = document.createElement("div")
                    num_likes_div.className = "num_likes_div"

                        let num_likes_link = document.createElement("b")
                        num_likes_link.id = "likes_link"+result[i][0]
                        num_likes_link.innerText = result[i][1].likers.length.toString() + " likes &"
                        num_likes_link.style.fontSize = "small"
                        num_likes_link.style.textAlign = "left"
                        num_likes_link.style.paddingLeft = "10px"
                        num_likes_link.style.cursor = "pointer"

                        num_likes_link.onclick = () => { show_likes(result[i][0], result[i][1])}

                        num_likes_div.appendChild(num_likes_link)
                    
                        likes_and_comments_div.appendChild(num_likes_div)

                    let num_comms_div = document.createElement("div")
                    num_comms_div.className = "num_likes_div"

                        let num_comms_link = document.createElement("b")
                        num_comms_link.id = "comments_link"+result[i][0]
                        num_comms_link.innerText = result[i][1].commenters.length.toString() + " comments"
                        num_comms_link.style.fontSize = "small"
                        num_comms_link.style.textAlign = "left"
                        num_comms_link.style.paddingLeft = "5px"
                        num_comms_link.style.cursor = "pointer"

                        num_comms_link.onclick = () => {show_comment_box(result[i][0], result[i][1])}

                        num_comms_div.appendChild(num_comms_link)
                    
                        likes_and_comments_div.appendChild(num_comms_div)
                    
                    let time_of_post_div = document.createElement("div")
                    time_of_post_div.className = "time_of_post_div"

                        let time_of_post = document.createElement("b")
                        time_of_post.style.fontSize = "small"
                        time_of_post.style.marginRight = "10px"
                        let post_time = new Date(result[i][1].timestamp.seconds*1000)
                        time_of_post.innerText = post_time.getFullYear() +"/"+ (JSON.stringify(post_time.getMonth()).length === 1 ? "0"+post_time.getMonth() : post_time.getMonth()) +"/"+ (JSON.stringify(post_time.getDate()).length === 1 ? "0" + post_time.getDate() : post_time.getDate()) +" "+ (JSON.stringify(post_time.getHours()).length === 1 ? "0"+post_time.getHours() : post_time.getHours()) + ":" + (JSON.stringify(post_time.getMinutes()).length === 1 ? "0" + post_time.getMinutes() : post_time.getMinutes());

                        time_of_post_div.appendChild(time_of_post)

                        likes_and_comments_div.appendChild(time_of_post_div)
                    
                        post_data.appendChild(likes_and_comments_div)
                
                    let comments_div_box = document.createElement("div")
                    comments_div_box.className = "comments_div_box"

                        let the_comment_text = document.createElement("p")
                        the_comment_text.style.textAlign = "left"
                        the_comment_text.style.fontSize = "smaller"
                        the_comment_text.style.paddingLeft = "10px"
                        the_comment_text.style.paddingRight = "10px"
                        let comment_to_show = ""
                        result[i][1].comment.split(" ").forEach((word) => {
                            if(word.startsWith("#") && word.length > 1){
                                comment_to_show += "<b>"+word+"</b> "
                            }else{
                                comment_to_show += word + " "
                            }
                        })

                        the_comment_text.innerHTML = comment_to_show

                        comments_div_box.appendChild(the_comment_text)
                            
                        post_data.appendChild(comments_div_box)
                
                try{
                    body.appendChild(post_data);
                    all_posts_doc.appendChild(body);
                    // update_post(result[i][0], result[i][1].image_url);
                }catch{}
            }

        try{
            all_posts_doc.style.width = Math.min(window.screen.width, 400) + "px";
            document.getElementById("header_in_all").style.width = Math.min(window.screen.width, 400) + "px";
            document.getElementById("posts_page").scrollTo(0, 0)
            if(to_scr){
                document.getElementById("posts_page").scrollTo(0, parseInt(localStorage.getItem("sc_till")) || 0)
            }
        }catch{}
    }

    // const show_saved_content = () => {

    // }

    // const are_new_posts = () => {

        // }

    const reset_view = () => {
        try{
            document.getElementById("all_posts").style.width = Math.min(window.screen.width, 360) + "px"
            document.getElementById("header_in_all").style.width = Math.min(window.screen.width, 360) + "px"
        }catch{}
    }

    const close_like_box = () => {
        try{
            document.getElementById("likes_div").style.display = "none"
        }catch{}
    }

    window.onresize = reset_view

    const scroll_handler = () => {
        try{
            localStorage.setItem("sc_till", document.getElementById("posts_page").scrollTop)
        }catch{}
    }

    setTimeout(() => {
        show_content(true)
    }, 0);

    return(
        <div id="posts_page" className="main_body_class" onScroll={scroll_handler}>
        <div id="page_all_posts" style={{width:Math.min(400, window.screen.width) + "px", margin:"auto"}}>
            <div className="header_in_all" id="header_in_all" style={{width:Math.min(400, window.screen.width) + "px"}}>
                <Navbar active="home"/>
            </div>
            <div className="body" id="all_the_content">
                <div id="all_posts" className="all_posts">
                    <div className="reloading">
                        <i className="fa fa-spinner fa-5x"></i>
                    </div>
                </div>
            </div>
        </div>
        <div id="likes_div" className="likes_div">
            <div className="likes_box" id="likes_box">
                <div className="to_close_like_box_div">
                    <b id="num_of_likes_title" style={{width:"80%", height:"fit-content", fontSize:"20px", textAlign:"center"}}>10 likes</b>
                    <i className="fa fa-times" onClick={close_like_box} style={{fontSize:"20px", width:"10%", float:"right", height:"fit-content", display:"block", justifyContent:"right", textAlign:"right", paddingRight:"10px"}}></i>
                </div>
                <div className="all_likers_div" id="all_likers_div">
                </div>
            </div>
        </div>
        {/* <div id="comments_div" className="comments_div">
            <div className="comments_box" id="comments_box">
                <div className="to_close_comments_box_div">
                    <b id="num_of_comments_title" style={{width:"80%", height:"fit-content", fontSize:"20px", textAlign:"center"}}>10 likes</b>
                    <i className="fa fa-times" onClick={close_comment_box} style={{fontSize:"20px", width:"10%", float:"right", height:"fit-content", display:"block", justifyContent:"right", textAlign:"right", paddingRight:"10px"}}></i>
                </div>
                    <form className="comment_input_div" onSubmit={e => {e.preventDefault(); post_comment()}}>
                        <input type="text" maxLength={50} id="input_comment" placeholder="enter comment here..." className="input_comment" onChange={handle_comment_input}/>
                        <button type="submit" onClick={post_comment} id="post_comment_button" className="comment_post_btn" disabled={!is_valid_comment} >Comment</button>
                    </form>
                <div className="all_comments_div" id="all_comments_div">
                </div>
            </div>
        </div> */}
        <div id="accept_request_alert_main" className="accept_request_alert_main">
            <div id="accept_request_alert_box" className="accept_request_alert_box">
                <div id="close_accept_request_box" className="close_accept_request_box">
                    <i className="fa fa-times" style={{fontSize:"25px"}} onClick={close_open_close_box} ></i>
                </div>
                <div className="accept_request_content" id="accept_request_content">
                    <h3>Do you want to accept the request?</h3> <button type="submit" className="accept_request_button" id="accept_request_button_yes" style={{backgroundColor: "greenyellow", fontSize:"large"}}>Yes</button> <button type="submit" id="accept_request_button_no" className="accept_request_button" style={{backgroundColor: "orange", color:"white", fontSize:"large"}}>No</button>
                </div>
                <div id="accept_request_actions_main" className="accept_request_actions_main">
                    <div id="accept_request_actions_box" className="accept_request_actions_box">
                        <a id="mail_with_desktop" href="/" className="accept_request_actions_button" style={{marginRight:"5%"}}>Mail  with desktop</a>
                        <a id="mail_with_phone" href="/" className="accept_request_actions_button" style={{marginLeft:"5%"}}>Mail with phone</a>
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}

export default All_content;
export { update_realtime };