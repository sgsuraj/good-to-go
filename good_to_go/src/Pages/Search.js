// import { getAuth } from 'firebase/auth';
import React, { useState } from 'react'
import { app, database } from '../firebaseConfig';
import Login from './Login';
import Navbar from './Navbar';
import '../CSS/Search.css';
import { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import def_user from "../images/def_user.jpg";
import def_post from "../images/def_post.jpg";
import { useNavigate } from 'react-router-dom';
// import ShowComments from './Comments_page';


const Search = (id) => {
  
    // const auth = getAuth(app);
    const uid = localStorage.getItem('uid');
    const [search_item, setsearch_item] = useState("");
    const my_saved_email = localStorage.getItem(uid+"email")
    const nav_to = useNavigate()
    const [showing_go_to_top, setshowing_go_to_top] = useState(false)
    let to_top_div = document.createElement("div")

  let ff = async() => {
  if(id !== undefined){
    await getDoc(doc(database, "Posts", id)).then( async(res) => {
      let seen_view = {}
      seen_view[id] = {
        seen: true,
        time: serverTimestamp()
      }
      await setDoc(doc(database, 'Notifications', localStorage.getItem(uid+"email")), seen_view, {merge: true})
      show_results([[id, res.data()]], null)
    })
  }}

  ff()
  
  const db = getFirestore(app);
  const collectionRef = collection(db, "Posts");

    // onAuthStateChanged(auth, (user) => {
    //     if (user != null) {
    //       localStorage.setItem(uid+'user_in', "y");
    //     } else {
    //       localStorage.removeItem(uid+'user_in');
    //     }
    // });

    if(localStorage.getItem(uid+"user_in") !== "y"){
        localStorage.setItem("going_to", "/search/"+id)
        return(Login())
    }


    const show_likes = async(post_id, data) => {
      localStorage.setItem("likes_info_data", JSON.stringify(data))
      nav_to("/likes/"+post_id);
      return
  }

  const show_comments = (post_id, data) => {
    localStorage.setItem("comments_info_data", JSON.stringify(data))
    nav_to("/comments/"+post_id)
    return
  }


    const show_results = (result, searched_for) => {
      const text = document.createElement('h5');
      text.innerHTML = "Showing results for tag: #"+searched_for
      let search_content = (document.getElementById("all_results_in_search") === null || localStorage.getItem("all_results_in_search") === undefined) ? document.createElement("div") : document.getElementById("all_results_in_search")
      search_content.innerHTML = ""
      if(searched_for !== null){
        search_content.appendChild(text)
      }
      for(let i=0; i<result.length; i++){
        const body = document.createElement('div');
        body.className = 'one_result_in_search';

            const user_data_div = document.createElement('div');
            user_data_div.className = 'user_data_in_search';

                const user_image_div = document.createElement("div")
                user_image_div.className = "user_image_div_in_search"

                    const user_img = document.createElement('img');
                    user_img.className="user_img_in_search";
                    user_img.src = result[i][1].pic === undefined ? def_user : result[i][1].pic;
                    user_img.alt = "img";
                    user_image_div.appendChild(user_img)
                    user_img.onerror = (err) => {
                      err = null
                      user_img.src = def_user
                    }

                user_data_div.appendChild(user_image_div)

                const user_info_div = document.createElement("div")
                user_info_div.className = "user_info_div_in_search"

                    const user_info = document.createElement('div');
                    user_info.className = 'user_info_in_search';

                        var name_and_email = document.createElement('p');
                        name_and_email.style.fontSize = "small"
                        name_and_email.innerHTML = (result[i][1].name === undefined ? "Name" : result[i][1].name ) + "<br/>" + (result[i][1].email === undefined ? "Email" : result[i][1].email );
                        user_info.appendChild(name_and_email);
                    
                    user_info_div.appendChild(user_info)
                
                user_data_div.appendChild(user_info_div);

            body.appendChild(user_data_div)

            const img_place = document.createElement('div')
            img_place.className = 'img_place_in_search';
  
                const img_style = document.createElement('img');
                img_style.className = 'img_style_in_search';
                img_style.src = result[i][1].image;
                img_style.alt = "img";
                img_place.appendChild(img_style);
                img_style.onerror = (err) => {
                  img_style.src = def_post
                }
  
            body.appendChild(img_place);

            const functions = document.createElement('div');
            functions.className = 'functions_in_search';

                const env1 = document.createElement('div');
                env1.className = 'separator_in_search';

                    const b1 = document.createElement('i')
                    b1.className = 'fa fa-thumbs-up';
                    b1.id = "search_like"+result[i][0]
                    if(result[i][1].likers !== undefined){
                      try{
                        b1.style.color = result[i][1].likers.includes(my_saved_email) ? "blue" : "white"
                      }catch{}
                    }
                    b1.onclick = () => {
                      like_post(result[i][0], result[i][1])
                    }
                    env1.appendChild(b1);

                functions.appendChild(env1)
                    
                const env2 = document.createElement('div');
                env2.className = 'separator_in_search';

                    const b2 = document.createElement('i')
                    b2.className = 'fa fa-comment';
                    b2.onclick = () => {comment_post(result[i][0], result[i][1])}
                    env2.appendChild(b2);
                functions.appendChild(env2);

                
                const env3 = document.createElement('div');
                env3.className = 'separator1_in_search';

                    const ref_btn = document.createElement("button")
                    ref_btn.className = "ref_btn_class_in_search"
                    ref_btn.id = "ref_btn_in_search"+result[i][0]
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
                    expend_btn.id = "exp_in_search"+result[i][0]
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
                    b3.className = "open_close_btn_in_search"
                    b3.id = "status_in_search"+result[i][0];

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
                    b3.onclick = () => {
                      localStorage.setItem("open_close_id", result[i][0]);
                      show_open_close(result[i][0], (result[i][1].image_url === undefined ? def_post : result[i][1].image_url), result[i][1])
                    }

                    env3.appendChild(expend_btn)
                    env3.appendChild(ref_btn)
                    env3.appendChild(b3);
                  
                  if(result[i][1].email !== my_saved_email){
                    functions.appendChild(env3);
                  }
                    
            body.appendChild(functions);

            const lct_div = document.createElement("div")
            lct_div.className = "lct_div"

              const likes_link = document.createElement("b");
              likes_link.id = "search_likes_link"+result[i][0]
              likes_link.className = "search_likes_link"
              likes_link.innerHTML = (result[i][1].likers !== undefined ? (result[i][1].likers.length !== undefined ? result[i][1].likers.length : "") : "") + " likes &"
              likes_link.onclick = () => {
                show_likes(result[i][0], result[i][1])
              }
              lct_div.appendChild(likes_link)

              const comments_link = document.createElement("b")
              comments_link.className = "search_likes_link"
              comments_link.style.paddingLeft = "5px"
              comments_link.id = "search_comments_link"+result[i][0]
              comments_link.innerHTML = (result[i][1].commenters !== undefined ? (result[i][1].commenters.length !== undefined ? result[i][1].commenters.length : "") : "") + " comments"
              comments_link.onclick = () => {
                show_comments(result[i][0], result[i][1])
              }
              lct_div.appendChild(comments_link)
            
              const post_time_search = document.createElement("b")
              post_time_search.className = "search_time_div"
              let post_time = new Date(result[i][1].timestamp.seconds*1000)
              post_time_search.innerHTML = post_time.getFullYear() +"/"+ (JSON.stringify(post_time.getMonth()).length === 1 ? "0"+post_time.getMonth() : post_time.getMonth()) +"/"+ (JSON.stringify(post_time.getDate()).length === 1 ? "0" + post_time.getDate() : post_time.getDate()) +" "+ (JSON.stringify(post_time.getHours()).length === 1 ? "0"+post_time.getHours() : post_time.getHours()) + ":" + (JSON.stringify(post_time.getMinutes()).length === 1 ? "0" + post_time.getMinutes() : post_time.getMinutes());
              lct_div.appendChild(post_time_search)

              body.appendChild(lct_div)

          let caption_div = document.createElement("div")
          caption_div.className = "caption_div"
          let comment_to_show = ""
          result[i][1].comment.split(" ").forEach((word) => {
            if(word.startsWith("#") && word.length > 1){
              if(word === "#"+searched_for){
                comment_to_show += "<b style='background-color: greenyellow'>"+word+"</b> "
              }else{
                comment_to_show += "<b>"+word+"</b> "
              }
            }else{
              comment_to_show += word + " "
            }
          })
          caption_div.innerHTML = comment_to_show
          body.appendChild(caption_div)


        search_content.appendChild(body);
      }
      try{
        document.getElementById("search_btn").innerHTML = "<i class='fa fa-search'></i> Search"
      }catch{}
      localStorage.setItem("search_result", JSON.stringify(result))
      localStorage.setItem("search_searched_for", searched_for)
    }

    const show_pre_result = async() => {
      to_top_div = document.getElementById("main_in_search")
      if( (JSON.parse(localStorage.getItem("search_result") === null ? '[]' : localStorage.getItem("search_result")).length > 0) && (localStorage.getItem("search_searched_for") === null ? "" : localStorage.getItem("search_searched_for")).length > 0){
        setsearch_item(localStorage.getItem("search_searched_for"))
          show_results(JSON.parse(localStorage.getItem("search_result")), localStorage.getItem("search_searched_for"))
      }
      var searched_data = []
      const q = query(collectionRef, where("tags", "array-contains", localStorage.getItem("search_searched_for")), orderBy("timestamp", "desc"), limit(100));
      await getDocs(q).then((res) => {
        if(res.docs.length > 0){
          for(let i=0; i<res.docs.length; i++){
            const result_doc = res.docs.at(i);
            const one_result = result_doc.data()
            const doc_id = result_doc.id;
            searched_data.push([doc_id, one_result]);
          }

            show_results(searched_data, localStorage.getItem("search_searched_for"));

        }
      })
    }

    const accept_the_request = async(post_id, info) => {
      id = post_id
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
              id: post_id,
              seen: false,
              image_url: info.image,
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

    const show_open_close = (post_id, oc_img_url, info_data) => {

      if(info_data.is_open === false){
          alert("Request has been closed!")
          return
      }

      localStorage.setItem("current_selected_post_id", post_id)
      try{
          let accept_the_request_button_yes = document.getElementById("accept_request_button_yes");
          accept_the_request_button_yes.onclick = () => {accept_the_request(post_id, info_data)}
          let accept_request_button_no = document.getElementById("accept_request_button_no");
          accept_request_button_no.onclick = do_not_accept_the_request
          let mail_with_desktop = document.getElementById("mail_with_desktop");
          mail_with_desktop.target = "_blank"
          mail_with_desktop.href = "https://mail.google.com/mail/?view=cm&fs=1&tf=1&to="+info_data.email+"&su="+info_data.name+", I would like to connect with you for...&body=Hey "+info_data.name+", I found your post: http://localhost:3000/post/"+post_id+" interesting. Could you pass a brief about your post.";
          let mail_with_phone = document.getElementById("mail_with_phone");
          mail_with_phone.target = "_blank"
          mail_with_phone.href = "mailto:"+ info_data.email +"?subject="+info_data.name+" I would like to connect with you for...&body=Hey "+info_data.name+", I found your post: http://localhost:3000/post/"+post_id+" interesting. Could you pass a brief about your post.";
          document.getElementById("accept_request_alert_main").style.display = "flex";
          document.getElementById("accept_request_alert_box").style.width = Math.min(400, document.getElementById("accept_request_alert_main").getBoundingClientRect().width) + "px"
      }catch{}
  }


    const refresh_open_close = async(id) => {
      await getDoc(doc(database, 'Posts', id)).then((res) => {
        try{
          document.getElementById("search_like"+id).style.color = res.data().likers.includes(my_saved_email) ? "blue" : "white";
            document.getElementById("likes_link"+id).innerText = res.data().likers.length.toString() + " likes &"
        }catch{}
        try{
            document.getElementById("comments_link"+id).innerText = res.data().commenters.length.toString() + " comments"
        }catch{}
        try{
            let oc_btn = document.getElementById("status_in_search"+id);
            let is_open_close = res.data().is_open;
            oc_btn.style.backgroundColor = is_open_close ? "greenyellow" : "orange";
            oc_btn.style.color = is_open_close ? "black" : "white";
            oc_btn.innerHTML = is_open_close ? "Open" : "Closed"
        }catch{}
        try{
            document.getElementById("exp_in_search"+id).className = "fa fa-angle-left"
            document.getElementById("ref_btn_in_search"+id).style.padding = "0px 0px 0px 0px"
            document.getElementById("ref_btn_in_search"+id).style.width = "0px"
            document.getElementById("ref_btn_in_search"+id).innerHTML = "fa fa-refresh"
        }catch{}
    })
    }

    const like_post = async(post_id, data) => {
      let lk_btn = document.getElementById("search_like"+post_id) === null ? document.createElement("div") : document.getElementById("search_like"+post_id)
      let lk_link = document.getElementById("search_likes_link"+post_id) === null ? document.createElement("div") : document.getElementById("search_likes_link"+post_id)
      lk_btn.style.color = data.likers.includes(my_saved_email) ? "white" : "blue"
      lk_btn.style.animation = "0.1s liking step-start";
      setTimeout(() => {
          lk_btn.style.animation = "";
      }, 100);
      await getDoc(doc(database, 'Posts', post_id)).then( async(res) => {
        let new_likers = res.data().likers === undefined ? [] : res.data().likers;
        let new_likers_info = res.data().likers_info === undefined ? {} : res.data().likers_info;
        let new_like = false
        if(new_likers.includes(my_saved_email)){
            lk_btn.style.color = "white"
            lk_link.innerHTML = (new_likers.length-1) + " likes &"
            new_likers.splice(new_likers.indexOf(my_saved_email), 1)
            delete new_likers_info[my_saved_email]
        }else{
            lk_btn.style.color = "blue"
            lk_link.innerHTML = (new_likers.length+1) + " likes &"
            new_like = true
            new_likers.push(my_saved_email)
            new_likers_info[my_saved_email] = localStorage.getItem(uid+"image")
        }
        data.likers = new_likers
        data.likers_info = new_likers_info;
        try{
            lk_btn.onclick = () => {
              like_post(post_id, data)
            }
        }catch{}
        let new_noti_to_save = {}
        if(new_like){
            new_noti_to_save["new"] = (data.email === my_saved_email ? false: true)
        }
        new_noti_to_save[post_id] = {
            type: "like&comment",
            id: post_id,
            seen: (data.email === my_saved_email ? true: false),
            time: serverTimestamp(),
            likers: new_likers,
            image_url: res.data().image,
            likers_info: new_likers_info
        }
        let new_likes_data = res.data()
        new_likes_data.likers = new_likers
        new_likes_data.likers_info = new_likers_info
        await setDoc(doc(database, 'Posts', post_id), new_likes_data)
        await setDoc(doc(database, 'Notifications', res.data().email), new_noti_to_save, {merge: true})
    })
    }

    const search = async() => {
      const loading = document.createElement('i');
      loading.className = 'fa fa-spinner';
      document.getElementById('all_results_in_search').innerHTML = ""
      document.getElementById("search_btn").disabled = true;
      document.getElementById("search_btn").style.backgroundColor = "lightgrey";
      document.getElementById('search_btn').innerHTML = ""
      document.getElementById("search_btn").appendChild(loading);
      var searched_data = []
      const q = query(collectionRef, where("tags", "array-contains", search_item), orderBy("timestamp", "desc"), limit(100));
      await getDocs(q).then((res) => {
        if(res.docs.length > 0){
          for(let i=0; i<res.docs.length; i++){
            const result_doc = res.docs.at(i);
            const one_result = result_doc.data()
            const doc_id = result_doc.id;
            searched_data.push([doc_id, one_result]);
          }

          show_results(searched_data, search_item);

        }
          const loading = document.createElement('i'); 
          // document.getElementById("all_results_in_search").innerHTML = "<h5>No results found for Tag: #"+search_item+"</h5>";
          loading.className = 'fa fa-search';
          document.getElementById("search_btn").disabled = false;
          document.getElementById("search_btn").style.backgroundColor = "blueviolet";
          document.getElementById('search_btn').innerHTML = ""
          document.getElementById("search_btn").appendChild(loading);
          document.getElementById('search_btn').innerHTML += " Search";
      })
  }

  let last_y = 50

  const set_search_bar = () => {
    if(last_y < to_top_div.getBoundingClientRect().top){
      setshowing_go_to_top(true)
    }else{
      setshowing_go_to_top(false)
    }
    last_y = to_top_div.getBoundingClientRect().top
  }

  const close_open_close_box = () => {
    try{
        localStorage.removeItem("current_selected_post_id")
        document.getElementById("accept_request_alert_main").style.display = "none"
    }catch{}
  }

  const show_comments_in_box = (post_id, data) => {
    try{

    }catch{}
  }

  const comment_post = (post_id, data) => {
    if(document.getElementById("search_real_full").getBoundingClientRect().width >= 800){
      try{
        document.getElementById("search_full").style.width = 400 + "px";
        document.getElementById("nav_in_search").style.width = 400 + "px";
        document.getElementById("div_like_or_comment_box_in_search").style.display = "flex"
        show_comments_in_box(post_id, data)
      }catch{}
    }else{
      localStorage.setItem("comments_info_data", JSON.stringify(data))
      nav_to("/comments/"+post_id)
      return
    }
  }    


  const close_like_comment_box = () => {
    try{
      document.getElementById("search_full").style.width = "fit-content";
      document.getElementById("nav_in_search").style.width = "fit-content";
      document.getElementById("div_like_or_comment_box_in_search").style.display = "none"
    }catch{}
  }

  const post_comment = () => {

  }

  return (
    <div className='search_real_full' id="search_real_full">
    <div id="search_full" className='search_full' onLoad={show_pre_result} onScroll={function(){set_search_bar()}}>
      <div className='nav_in_search' id="nav_in_search">
        <div className='nav_main_in_search' style={{width: Math.min(window.screen.width, 400) + "px"}}>
          <Navbar active="search"/>
        </div>
      </div>
      <div className='main_in_search' id="search_main" >
        <div className='body_in_search' style={{width: Math.min(window.screen.width, 400) + "px"}}>
          <div className='search_box_in_search' id="search_box_in_search">
            <form className='search_bar_in_search' onSubmit={(e) => {e.preventDefault(); if(search_item.length > 0){search()}}}>
              <div className='search_inp_in_search_div'>
                <input type="text" id="search_input_search_text" className='search_inp_in_search' placeholder='search with tag' onChange={(e) => {setsearch_item(e.target.value)}} />
              </div>
              <button id="search_btn" type="submit" className='search_btn_in_search' onClick={(e) => {e.preventDefault(); if(search_item.length > 0){search()}}}> { localStorage.getItem("search_searched_for") === null ? <i className='fa fa-search'></i> : <i className='fa fa-spinner'></i>}</button>
            </form>
          </div>
        </div>
        <div className='results_body_in_search'>
          <div className='all_results_in_search' id='all_results_in_search' style={{width: Math.min(400, window.screen.width) + "px"}}>
          </div>
        </div>
      </div>
      <div className='go_to_top_div' id="go_to_top_div" style={{display:showing_go_to_top ? "flex" : "none", right: (window.screen.width)/2 - (Math.min(400, window.screen.width))/2 + "px"}}>
        <div className='go_to_top_btn'>
          <i className='fa fa-angle-up'></i>
        </div>
      </div>
    </div>
      <div id="accept_request_alert_main" className="search_accept_request_alert_main">
            <div id="accept_request_alert_box" className="search_accept_request_alert_box">
              <div id="close_accept_request_box" className="search_close_accept_request_box">
                <i className="fa fa-times" style={{fontSize:"25px", padding:"7px 7px"}} onClick={close_open_close_box} ></i>
              </div>
              <div className="accept_request_content" id="search_accept_request_content">
                  <h3>Do you want to accept the request?</h3> <button type="submit" className="search_accept_request_button" id="accept_request_button_yes" style={{backgroundColor: "greenyellow", fontSize:"large"}}>Yes</button> <button type="submit" id="accept_request_button_no" className="search_accept_request_button" style={{backgroundColor: "orange", color:"white", fontSize:"large"}}>No</button>
              </div>
              <div id="accept_request_actions_main" className="search_accept_request_actions_main">
                  <div id="accept_request_actions_box" className="search_accept_request_actions_box">
                      <a id="mail_with_desktop" href="/" className="search_accept_request_actions_button" style={{marginRight:"5%"}}>Mail  with desktop</a>
                      <a id="mail_with_phone" href="/" className="search_accept_request_actions_button" style={{marginLeft:"5%"}}>Mail with phone</a>
                  </div>
              </div>
            </div>
        </div>
    <div className='div_like_or_comment_box_in_search' id="div_like_or_comment_box_in_search">
      <div className='like_or_comment_box_in_search' id="like_or_comment_box_in_search">
        <div className='close_box_div' id='close_box_div'>
          <i className='fa fa-times' onClick={close_like_comment_box}></i>
        </div>
        <div className='box_content_div' id="box_content_div">
          <div className='input_div'>
            <textarea className='input_comment_style'></textarea>
          </div>
          <div className='submit_div'>
            <button className='submit_btn_in_box' onSubmit={post_comment}>Post new comment</button>
          </div>
        </div>
        <div className='pre_comments_div'>
          <h5>No comments</h5>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Search;