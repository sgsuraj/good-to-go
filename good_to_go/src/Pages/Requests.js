import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React from 'react';
import { app, database } from '../firebaseConfig';
import Login from './Login';
import Navbar from './Navbar';
import '../CSS/Requests.css';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export let add_new_like_noti = () => {}

export let show_all_noti = () => {}

export let set_seen = false;

export let set_it_unseen = () => {
    set_seen = false;
}

export default function Requests() {
  const auth = getAuth(app);
  const uid = localStorage.getItem('uid');
  const nav_to = useNavigate()

    localStorage.setItem("seen_updates", "y");
    localStorage.setItem("ringing", "n")
    localStorage.setItem("are_new_noti", "n")

    let update_db = async() => {
      await setDoc(doc(database, 'Notifications', localStorage.getItem(uid+"email")), {
        new: false
      }, {merge: true})
    }
    update_db()
    localStorage.setItem("last_seen_data", localStorage.getItem("new_seen_data"))


    // onAuthStateChanged(auth, (user) => {
    //     if (user != null) {
    //       localStorage.setItem(uid+'user_in', "y");
    //     } else {
    //       localStorage.removeItem(uid+'user_in');
    //     }
    // });

    if(localStorage.getItem(uid+"user_in") !== "y"){
        return(Login())
    }

    add_new_like_noti = (id) => {

    }
    
    show_all_noti = () => {
      let req_content_main = document.getElementById("req_content_main");
      try{
        req_content_main.innerHTML = ""
      }catch{}
      let noti_docs_data_JSON = JSON.parse(localStorage.getItem("noti_data_main") || '{}');
      let noti_docs_data = []
      for(let tp in noti_docs_data_JSON){
        if(tp !== "new"){
          noti_docs_data.push([tp, noti_docs_data_JSON[tp]])
        }
      }
      try{
        noti_docs_data.sort((a, b) => (b[1].time.seconds - a[1].time.seconds))
      }catch{}
      for(let iii of noti_docs_data){
        let item = iii[1]
        let one_noti_div = document.createElement("div");
        one_noti_div.className = "one_noti_div"
        if(item.type === "like&comment"){
          let liker_data = item.likers === undefined ? [] : item.likers
          let commenter_data = item.commenters === undefined ? [] : item.commenters
          one_noti_div.innerHTML = 
                                  ( liker_data.length > 0 ? 
                                    ( (liker_data.length > 1 ? 
                                      ("<b>"+ (liker_data[liker_data.length - 1]) +"</b> and <b>" + (liker_data.length-1) + "</b> others liked ") 
                                      : ("<b>"+ (liker_data[liker_data.length - 1]) +"</b> liked ")) + ((liker_data.length > 0 && commenter_data.length > 0) ? "and " : ""))
                                    :"") + 
                                  (commenter_data.length > 0 ? ("<b>" + commenter_data.length + "</b> " + (commenter_data.length > 1 ? "users" : "user") + " commented on ") : "") + "your post <img src='"+item.image_url+"' class='image_in_noti' alt='img'></img>"
          one_noti_div.style.backgroundColor = item.seen === true ? "aliceblue" : "aqua";
          one_noti_div.onclick = async() => {
            one_noti_div.style.backgroundColor = "aliceblue";
            noti_docs_data_JSON[item.id].seen = true
            localStorage.setItem("noti_data_main", JSON.stringify(noti_docs_data_JSON))
            localStorage.setItem("selected_post_detail", JSON.stringify([null, null]))
            // set_seen = true
            nav_to("/post/"+item.id)
            return
          }
          if(liker_data.length > 0 || commenter_data.length > 0){ req_content_main.appendChild(one_noti_div) }
        }else if(item.type === "connect"){
          if(item.people !== undefined && item.people.length !== undefined && item.people.length > 0){

            one_noti_div.innerHTML = (item.people.length > 1 ? ( "<b>" + item.people[item.people.length-1] + "</b> and <b>" + (item.people.length-1).toString() + " others</b> want ") : ("<b>" + item.people[0] + "</b> wants ")) + "to connect with you regarding your post <img src='"+item.image_url+"' class='image_in_noti' alt='img'></img>"

            one_noti_div.style.backgroundColor = item.seen === true ? "aliceblue" : "aqua";
            one_noti_div.onclick = async() => {
              one_noti_div.style.backgroundColor = "aliceblue";
              noti_docs_data_JSON[item.id+"connect"].seen = true
              localStorage.setItem("noti_data_main", JSON.stringify(noti_docs_data_JSON))
              nav_to("/connect/"+iii[0])
              return
            }
            req_content_main.appendChild(one_noti_div)
          }
        }else if(item.type === "tags"){
          let inte_to_show = ''
          JSON.parse(localStorage.getItem("my_inte_arr") === null ? '[]' : localStorage.getItem("my_inte_arr")).forEach((inte, ind) => {
            if(ind !== 0){
              inte_to_show += ", "
            }
            inte_to_show += inte
          })
          one_noti_div.innerHTML = 'A post related to your interests: <b>'+inte_to_show+'</b> is shared by '+ (item.email === undefined ? "user" : item.email) + " <img src='"+item.image_url+"' class='image_in_noti' alt='img'></img>"
          one_noti_div.style.backgroundColor = item.seen === true ? "aliceblue" : "aqua";
          one_noti_div.onclick = () => {
            one_noti_div.style.backgroundColor = "aliceblue";
            noti_docs_data_JSON[item.id].seen = true
            localStorage.setItem("noti_data_main", JSON.stringify(noti_docs_data_JSON))
            localStorage.setItem("selected_post_detail", JSON.stringify([null, null]))
            // set_seen = true
            nav_to("/post/"+item.id)
            return
          }
          req_content_main.appendChild(one_noti_div)
        }
      }
    }

    // const to_update = async() => {
    //   const cl = await onSnapshot(doc(database, 'Notfications', localStorage.getItem(uid+"email"), "MyNoti", 'tags'), async(querySnapshot) => {

    //   })
    // }

  // <div id="posts_page" className="main_body_class" onScroll={scroll_handler} onLoad={show_content}>
  //       <div id="page_all_posts" style={{width:Math.min(400, window.screen.width) + "px", margin:"auto"}}>
  //           <div className="header_in_all" id="header_in_all" style={{width:Math.min(400, window.screen.width) + "px"}}>
  //               <Navbar active="home"/>
  //           </div>
  //           <div className="body" id="all_the_content">
  //               <div id="all_posts" className="all_posts">
  //                   <div className="reloading">
  //                       <i className="fa fa-spinner fa-5x"></i>
  //                   </div>
  //               </div>
  //           </div>
  //       </div>
  //     </div>
  
  return (
    <div className='req_full' onLoad={show_all_noti}>
      <div className='req_header'>
        <Navbar active="requests" disable_anime={true}/>
      </div>
      <div className='req_content_full'>
        <div className='req_content_main' id="req_content_main">
        </div>
      </div>
    </div>
  )
}
