import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useState } from 'react';
import { app, database } from '../firebaseConfig';
import Login from './Login';
import Navbar, { logout } from './Navbar';
import '../CSS/Profile.css';
import { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import def_user from '../images/def_user.jpg';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { set_my_img } from '../App';

export default function Profile() {

  localStorage.setItem("is_in_all", "n")

  const storage = getStorage(app)
  const [my_inte_arr, setmy_inte_arr] = useState(JSON.parse(localStorage.getItem("my_inte_arr") || '[]'))

  const nav_to = useNavigate()

  const [in_first, setin_first] = useState(true)

  const uid = localStorage.getItem('uid');
  const auth = getAuth(app);
  let name = localStorage.getItem(uid+'name');
  const image = localStorage.getItem(uid+'image');
  var selected_image = image
  const email = localStorage.getItem(uid+'email');
  const [made_changes, setmade_changes] = useState(false)
  const [selected_image_file, setselected_image_file] = useState(null)
  const [new_name, setnew_name] = useState("")
  const [input_inte_tag, setinput_inte_tag] = useState("")
  const [showing_inte_div, setshowing_inte_div] = useState(false)

  var all_tags_content = document.createElement('div');
  all_tags_content.className = 'all_tag_box';
  all_tags_content.id = "all_tags"

  if(localStorage.getItem(uid+"user_in") !== "y"){
    return(Login())
  }

  // onAuthStateChanged(auth, (user) => {
  //       if (user != null) {
  //         localStorage.setItem(uid+'user_in', "y");
  //       } else {
  //         Logout_fun()
  //       }
  //   });

    let unsub_to = () => {}

    window.onunload = unsub_to
    
    const db = getFirestore(app);
    const collectionRef = collection(db, "Posts");


    var all_my_posts = []


    const do_refresh = (res, pre) => {
      if(res.length !== pre.length){
        return true
      }
      for(let i=0; i<res.length; i++){
        let same = true
        if(res[i].data().likers.length !== pre[i].likers.length){
          same = false
          return true
        }
        for(let k=0; k<pre[i].likers.length; k++){
          if(pre[i].likers[k] !== res[i].data().likers[k] || pre[i].commenters[k] !== res[i].data().commenters[k]){
            same = false
            break
          }
        }
        if(!same){
          return true
        }
      }
      return false
    }

    const show_my_content = async() => {
      if(localStorage.getItem("my_inte_arr") === null){
        let get_inte_doc = await getDoc(doc(database, "Interests", localStorage.getItem(uid+"email")));
        setmy_inte_arr(get_inte_doc.data().interests)
        localStorage.setItem("my_inte_arr", JSON.stringify(get_inte_doc.data().interests === undefined ? [] : get_inte_doc.data().interests))
      }else{
        setmy_inte_arr(JSON.parse(localStorage.getItem("my_inte_arr")))
      }
      let my_inte_show_span = document.getElementById("my_inte_show_span") || document.createElement("div")
      my_inte_show_span.innerHTML = ''
      let temppp = JSON.parse(localStorage.getItem("my_inte_arr") || '[]')
      for(let i=0; i<temppp.length; i++){
        let a_inte_b = document.createElement("b")
        a_inte_b.id = temppp[i]
        a_inte_b.className = "my_inte_show_span"
        a_inte_b.innerHTML = temppp[i]

          let remove_tag_icon = document.createElement("i")
          remove_tag_icon.className = "fa fa-times"
          remove_tag_icon.id = "remove_tag_"+temppp[i]
          remove_tag_icon.onclick = () => {remove_tag(temppp[i])}
          a_inte_b.appendChild(remove_tag_icon)

          my_inte_show_span.appendChild(a_inte_b)
      }
      try{
        document.getElementById("features_div").style.display = in_first ? "none" : "block";
        document.getElementById("pre_posts_div").style.height = document.getElementById("profile_full").getBoundingClientRect().height - 150 + "px"
        document.getElementById("features_div").style.height = document.getElementById("profile_full").getBoundingClientRect().height - 150 + "px"
      }catch{}
      // localStorage.removeItem("my_posts_data")
      if(localStorage.getItem("my_pre_data_JSON") === null){
        const q = query(collectionRef, orderBy("timestamp", "desc"), where("email", "==", email), limit(100));
        await getDocs(q).then((res) => {
            let pre_data = []
            if(res.docs.length > 0){
                for(let i=0; i<res.docs.length; i++){
                  pre_data.push(res.docs[i].data())
                    const d = res.docs[i];
                    const post = {
                        "email": d.data().email,
                        "timestamp": d.data().timestamp,
                        "tags": d.data().tags,
                        "comment": d.data().comment,
                        "image_url": d.data().image,
                        "name": d.data().name,
                        "pic": d.data().pic,
                        "is_open": d.data().is_open,
                        "likers": d.data().likers,
                        "likers_info": d.data().likers_info,
                        "commenters": d.data().commenters,
                        "commenters_info": d.data().commenters_info
                    }
                    const id = d.id;
                    all_my_posts.push([id, post])
                }
                localStorage.setItem("my_pre_data_JSON", JSON.stringify(pre_data))
                localStorage.setItem("my_posts_data", JSON.stringify(all_my_posts))
                localStorage.setItem("my_pre_docs", JSON.stringify(res.docs.forEach((doc) => {return doc.data()}) ))
                show_my_posts(all_my_posts);
                all_my_posts = []
            }else{
                show_empty_feed();
            }
        })
      }else{
        show_my_posts(JSON.parse(localStorage.getItem("my_posts_data")))
        let new_query = query(collectionRef, orderBy("timestamp", "desc"), where("email", "==", email), limit(100));
        await getDocs(new_query).then((res) => {
          if( do_refresh(res.docs, JSON.parse(localStorage.getItem("my_pre_data_JSON")))){
            let pre_data = []
            if(res.docs.length > 0){
              for(let i=0; i<res.docs.length; i++){
                pre_data.push(res.docs[i].data())
                  const d = res.docs[i];
                  const post = {
                      "email": d.data().email,
                      "timestamp": d.data().timestamp,
                      "tags": d.data().tags,
                      "comment": d.data().comment,
                      "image_url": d.data().image,
                      "name": d.data().name,
                      "pic": d.data().pic,
                      "is_open": d.data().is_open,
                      "likers": d.data().likers,
                      "likers_info": d.data().likers_info,
                      "commenters": d.data().commenters,
                      "commenters_info": d.data().commenters_info
                  }
                  const id = d.id;
                  all_my_posts.push([id, post])
              }
              localStorage.setItem("my_pre_data_JSON", JSON.stringify(pre_data))
              localStorage.setItem("my_posts_data", JSON.stringify(all_my_posts))
              localStorage.setItem("my_pre_docs", JSON.stringify(res.docs));
              if(all_my_posts.length !== (JSON.parse(localStorage.getItem("my_posts_data"))).length){
                show_my_posts(all_my_posts);
              }
              all_my_posts = []
          }else{
              show_empty_feed();
          }
          }
        })
      }
    }

    const show_empty_feed = () => {
      try{
        document.getElementById("loading_my_posts").style.display = "none"
        var all_posts_doc = document.getElementById("my_posts_pics_div");
        all_posts_doc.innerHTML = "Empty feed!"
      }catch{}
  }

    const show_my_posts = async(result) => {

      let my_posts_pics_div = document.getElementById("my_posts_pics_div") || document.createElement("div");
      my_posts_pics_div.innerHTML = ""
      try{
        document.getElementById("loading_my_posts").style.display = "none"
      }catch{}

      for(let t=0; t<1; t++){
      for(let ind=0; ind < result.length; ind++){
        let one_post_pic_div = document.createElement("div")
        one_post_pic_div.className = "one_post_pic_div"

            let one_post_pic = document.createElement("img")
            one_post_pic.src = result[ind][1].image_url;
            one_post_pic.alt = "post"
            one_post_pic.className = "one_post_pic_style"
            if(ind%3 !== 2){
              one_post_pic_div.style.marginRight = "0.8%"
            }

            one_post_pic_div.appendChild(one_post_pic)

            let details_div = document.createElement("div")
            details_div.className = "details_div"

                let details_l_and_c = document.createElement("div")
                details_l_and_c.className = "details_l_and_c"

                    let details_likes_and_comments_div = document.createElement("div")
                    details_likes_and_comments_div.id = "details_likes_and_comments_div"+result[ind][0]
                    details_likes_and_comments_div.className = "details_likes_and_comments_div"

                    details_likes_and_comments_div.innerHTML = "<i class='fa fa-thumbs-up' style='color:white; font-size:20pxs'></i> "+result[ind][1].likers.length + " </br> <i class='fa fa-comment'></i> "+result[ind][1].commenters.length

                    details_l_and_c.appendChild(details_likes_and_comments_div)
                
                    details_div.appendChild(details_l_and_c)
            
                    details_div.onclick = () => {
                      localStorage.setItem("selected_post_detail", JSON.stringify(result[ind]))
                      nav_to("/post/"+result[ind][0])
                      return
                    }

            one_post_pic_div.appendChild(details_div)

            one_post_pic_div.onmouseover = () => {
              details_div.style.display = "flex"
            }
            one_post_pic_div.onmouseout = () => {
              details_div.style.display = "none"
            }
          
        my_posts_pics_div.appendChild(one_post_pic_div)
        // update_doc(result[ind][0])
      }}
    }

    const edit_name_btn = () => {
      setnew_name(name.length > 25 ? name.slice(0, 25) : name)
      try{
        document.getElementById("curr_name").style.display = "none"
        document.getElementById("input_name_text").style.display = "block"
        document.getElementById("input_name_text").value = name.length > 25 ? name.slice(0, 25) : name
        document.getElementById("save_name_btn").style.display = "flex"
        document.getElementById("cancel_name_btn").style.display = "flex"
        document.getElementById("edit_name_btn").style.display = "none"
      }catch{}
    }

    const save_name = async() => {

      try{
        document.getElementById("saving_name_full").style.display = "flex";
        document.getElementById("saving_name_full").setAttribute("disabled", "disabled")
        document.getElementById("save_name_btn").innerHTML = "<i class='fa fa-spinner' style='backgroundColor:greenyellow; padding: 7px; fontSize:25px'></i>"
      }catch{}

      await setDoc(doc(database, 'user', localStorage.getItem(uid+"email")), 
        {name: new_name}, {merge: true}
      )

      let temp_query = query(collectionRef, where("email", "==", localStorage.getItem(uid+"email")));
      await getDocs(temp_query).then(async(res) => {
        for(let i=0; i<res.docs.length; i++){
          await updateDoc(doc(database, 'Posts', res.docs[i].id), {
            name: new_name
          })
        }
      })

      try{
        document.getElementById("curr_name").innerText = new_name;
      }catch{}
      localStorage.setItem(uid+"name", new_name)
      name = new_name
      try{
        document.getElementById("input_name_text").style.display = "none"
        document.getElementById("curr_name").style.display = "block"
        document.getElementById("save_name_btn").innerHTML = "<i class='fa fa-check' style='backgroundColor:greenyellow; padding: 7px; fontSize:25px'></i>"
        document.getElementById("save_name_btn").style.display = "none"
        document.getElementById("cancel_name_btn").style.display = "none"
        document.getElementById("edit_name_btn").style.display = "flex"
        document.getElementById("saving_name_full").style.display = "none"
      }catch{}
    }

    const cancel_save_name = () => {
      setnew_name("")
      try{
        document.getElementById("input_name_text").style.display = "none"
        document.getElementById("curr_name").style.display = "block"
        document.getElementById("save_name_btn").style.display = "none"
        document.getElementById("cancel_name_btn").style.display = "none"
        document.getElementById("edit_name_btn").style.display = "flex"
      }catch{}
    }

    const edit_image_btn = () => {
      try{
        document.getElementById("edit_image_div").style.display = "flex";
      }catch{}
      setTimeout(() => {
        try{
          document.getElementById("uploading_spinner").style.display = "none"
        }catch{}
      }, 20000);
    }

    const save_changes = async() => {
      if(selected_image_file != null){
        const storage_ref = ref(storage, 'Profile_images/'+email);
        const upload_task = uploadBytesResumable(storage_ref, selected_image_file);
        upload_task.on('state_changed', (snapshot) => {
          try{
            document.getElementById("uploading_spinner").style.display = "flex"
          }catch{}
        },
        (err) => {
          alert(err)
        },
        async() => {
          getDownloadURL(upload_task.snapshot.ref).then(async(downloadurl) => {

            let temp_q = query(collectionRef, where("email", "==", email));
            await getDocs(temp_q).then( async(res) => {
              for(let a_doc of res.docs){
                await updateDoc(doc(database, 'Posts', a_doc.id), {
                  pic: downloadurl
                })
              }
            })
            set_my_img(downloadurl)
            localStorage.setItem(uid+"image", downloadurl)
            selected_image = downloadurl;
            try{
              document.getElementById("selected_image_src").src = downloadurl
            }catch{}
            setmade_changes(false)
            try{
              document.getElementById("uploading_spinner").style.display = "none"
              document.getElementById("edit_image_div").style.display = "none"
            }catch{}
          })
        }
        )
      }else{
        localStorage.setItem(uid+"image", "https://firebasestorage.googleapis.com/v0/b/goodtogo-eae56.appspot.com/o/default%2Fdef_user.jpg?alt=media&token=4430d0c2-338b-4a3c-87e3-28e75b8b2e1c")
        selected_image = "https://firebasestorage.googleapis.com/v0/b/goodtogo-eae56.appspot.com/o/default%2Fdef_user.jpg?alt=media&token=4430d0c2-338b-4a3c-87e3-28e75b8b2e1c"
        try{
          document.getElementById("selected_image_src").src = "https://firebasestorage.googleapis.com/v0/b/goodtogo-eae56.appspot.com/o/default%2Fdef_user.jpg?alt=media&token=4430d0c2-338b-4a3c-87e3-28e75b8b2e1c"
        }catch{}
        setmade_changes(false)
        try{
          document.getElementById("uploading_spinner").style.display = "none"
          document.getElementById("edit_image_div").style.display = "none"
        }catch{}
      }
    }

    const change_image = (selected_image_src) => {
        var file = selected_image_src;
        let reader = new FileReader()
        reader.readAsDataURL(file);
        reader.onerror = (err) => {
            alert(err.message);
        }
        reader.onload = () => {
          try{
              document.getElementById("selected_image_src").src = reader.result;
          }catch{}
        };
        setmade_changes(true)
    }

    const remove_image = () => {
      try{
        document.getElementById("selected_image_src").src = def_user
      }catch{}
      setmade_changes(true)
      setselected_image_file(null)
    }

    const close_edit_image_box = () => {
      try{
        document.getElementById("edit_image_div").style.display = "none"
      }catch{}
      setmade_changes(false)
      selected_image = image
    }

    const go_in_first = () => {
      if(!in_first){
        setin_first(true)
        try{
          document.getElementById("features_div").style.display = "none"
          document.getElementById("pre_posts_div").style.display = "block"
        }catch{}
      }
    }

    const go_in_second = () => {
      if(in_first){
        setin_first(false)
        try{
          document.getElementById("features_div").style.display = "block"
          document.getElementById("pre_posts_div").style.display = "none"
        }catch{}
      }
    }

    const add_interests_div = () => {
      try{
        document.getElementById("add_interests_div").style.display = showing_inte_div ? 'none' : 'flex';
      }catch{}
      setshowing_inte_div(!showing_inte_div)
    }

    const add_interest_btn = async() => {
      if(my_inte_arr.length === 10){
        alert("only 10 interest taga are allowed!")
        return
      }
      if(my_inte_arr.length === 0){
        setmy_inte_arr([])
        localStorage.setItem("my_inte_arr", JSON.stringify([]))
      }
      if(my_inte_arr.length > 0 && my_inte_arr.indexOf(input_inte_tag) !== -1){
        alert("Tag already added...")
        return
      }
      if(input_inte_tag.length === 0){
        alert("Please enter valid tag...")
        return
      }
      try{
        document.getElementById("main_add_tag_btn").innerHTML = '<i class="fa fa-spinner"></i>'
      }catch{}
      let gg = my_inte_arr;
      try{
        gg = [...gg]
        gg = my_inte_arr
      }catch{
        gg = []
        setmy_inte_arr([])
        localStorage.setItem("my_inte_arr", '[]')
      }
      await setDoc(doc(database, 'Interests', localStorage.getItem(uid+"email")), {
        interests: [...gg, input_inte_tag]
      })

      let new_inte_tag_box = document.createElement("b")
      new_inte_tag_box.id = input_inte_tag
      new_inte_tag_box.className = "my_inte_show_span"
      new_inte_tag_box.innerHTML = input_inte_tag

          let remove_tag_icon = document.createElement("i")
          remove_tag_icon.className = "fa fa-times"
          remove_tag_icon.id = "remove_tag_"+input_inte_tag
          remove_tag_icon.onclick = () => {remove_tag(input_inte_tag)}
          new_inte_tag_box.appendChild(remove_tag_icon)

          if(document.getElementById(input_inte_tag) == null){
            try{
              document.getElementById("my_inte_show_span").appendChild(new_inte_tag_box)
            }catch{}
          }
          setmy_inte_arr([...gg, input_inte_tag])
          setinput_inte_tag("")
          try{
            document.getElementById("input_tags_input").value = ""
          }catch{}
          localStorage.setItem("my_inte_arr", JSON.stringify([...my_inte_arr, input_inte_tag]))
          try{
            document.getElementById("main_add_tag_btn").innerHTML = 'Add'
          }catch{}
    }

    const remove_tag = async(inte) => {
      let new_inte_arr = JSON.parse(localStorage.getItem("my_inte_arr") || '[]');
      if(new_inte_arr.indexOf(inte) !== -1){
        try{
          document.getElementById("remove_tag_"+inte).className = "fa fa-spinner"
        }catch{}
        new_inte_arr.splice(new_inte_arr.indexOf(inte), 1)
        await setDoc(doc(database, 'Interests', localStorage.getItem(uid+"email")), {
          interests: new_inte_arr
        })
        localStorage.setItem("my_inte_arr", JSON.stringify(new_inte_arr))
        setmy_inte_arr(new_inte_arr)
        new_inte_arr.sort()
        localStorage.setItem("new_seen_data", JSON.stringify(new_inte_arr))
        localStorage.setItem("last_seen_data", JSON.stringify(new_inte_arr))
        try{
          document.getElementById(inte).parentElement.removeChild(document.getElementById(inte))
        }catch{}
      }
    }

    const inputting_tag = (e) => {
      try{
        document.getElementById("input_tags_input").value = e.target.value.replaceAll(" ", "")
      }catch{}
      setinput_inte_tag(e.target.value)
    }

    const remove_pic = () => {
      selected_image = def_user
      document.getElementById("selected_image_src").src = image === null ? def_user : image
    }

    return (
        <div className='profile_full' id="profile_full" onLoad={show_my_content}>
          <div className='uploading_spinner_full' id="uploading_spinner">
            <div className='uploading_spinner_div'>
              <i className='fa fa-spinner' style={{fontSize:"40px", color:"black"}}></i>
            </div>
          </div>
          <div className='saving_name_full' id="saving_name_full">
            <div style={{width:"fit-content", height:"fit-content", padding:"10px 20px", backgroundColor:"white", color:"black", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center"}}>Changing Name... <i className='fa fa-spinner' style={{fontSize:"20px", color:"black"}}></i></div>
          </div>
          <div className='edit_image_div' id="edit_image_div">
            <div className='edit_image_box'>
              <div className='close_tab_div'>
                <div className='title_div'>
                  <h4>Edit Profile Image</h4>
                </div>
                <div style={{width:"10%", float:"left", justifyContent:'right', textAlign:"right"}}>
                  <i className='fa fa-times fa-2x' onClick={close_edit_image_box}></i>
                </div>
              </div>
              <div className='edit_image_fun'>
                <div className='pre_image_div'>
                  <img id="selected_image_src" src={selected_image} onError={({ currentTarget }) => {currentTarget.onerror = null; currentTarget.src=def_user}} alt='pre_pic' style={{width:"100px", aspectRatio:1, borderRadius:"50%", border:"1px solid gainsboro"}}/>
                </div>
                <div className='edit_image_buttons_div'>
                  <div className='edit_image_buttons_box'>
                    <div className='edit_image_one_button_div'>
                      <input type={'file'} id="input_image_file" className='change_image_btn' onChange={(e) => {if(e.target.files[0] !== undefined && (e.target.files[0].type === "image/png" || e.target.files[0].type === "image/jpeg")){change_image(e.target.files[0]); setselected_image_file(e.target.files[0])}else{remove_pic()}}} accept="image/png, image/jpeg"/>
                    </div>
                    <div className='edit_image_one_button_div'>
                      <button type="submit" className='remove_image_btn' onClick={remove_image}>Remove image</button>
                    </div>
                  </div>
                </div>
                <div className='save_changes_div'>
                  <button type='submit' className='save_changes_btn' style={{backgroundColor: made_changes ? "blue" : "skyblue" }} onClick={save_changes} disabled={!made_changes}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
          <div className='profile_main'>
          <div className='navbar_prof' style={{width: Math.min(window.screen.width, 400) + "px"}}>
            <Navbar active="profile" my_inte_arr={my_inte_arr}/>
          </div>
          <div className='info_inte'>
              <div className='user_data_prof'>
                <div className='user_image_prof'>
                  <img id="my_pic" className='img_style_prof' onError={({ currentTarget }) => {currentTarget.onerror = null; currentTarget.src=def_user}} style={{border:"1px solid gainsboro"}} src={image} alt='user'/>
                  <div className="image_edit_btn"><button className='edit_btn' onClick={edit_image_btn}><i className='fa fa-edit fa-2x'></i></button></div>
                </div>
                <div className='user_info_prof'>
                  <div className='name_and_edit'>
                    <div className='user_info_prof_name' style={{width:"80%"}}>
                      <b id="curr_name">{name.length > 25 ? name.slice(0, 25) + "..." : name}</b>
                      <input id="input_name_text" type={"text"} maxLength={25} style={{width:"100%", display:"none"}} onChange={(e) => setnew_name(e.target.value)} />
                    </div>
                    <button id="edit_name_btn" className="edit_name_btn_cls" type='submit' onClick={edit_name_btn}><i className='fa fa-edit'></i></button>
                    <button id="save_name_btn" style={{width:"10%", padding:"0px", height:"fit-content", aspectRatio:1, float:"right", backgroundColor:"transparent", borderRadius:"50%", border:"none", display:"none"}} type='submit' onClick={save_name}><i className='fa fa-check' style={{backgroundColor:"greenyellow", padding:"5px", fontSize:"15px"}}></i></button>
                    <button id="cancel_name_btn" style={{width:"10%", height:"fit-content", aspectRatio:1, float:"right", backgroundColor:"transparent", borderRadius:"50%", border:"none", display:"none"}} type='submit' onClick={cancel_save_name}><i className='fa fa-times' style={{WebkitTextStrokeWidth:"1px", aspectRatio:1, fontSize:"15px", padding:"5px 7px", backgroundColor:"orange", borderRadius:"50%"}}></i></button>
                  </div>
                  <div className='user_info_prof_email'>{email}</div>
                </div>
              </div>
          </div>

          <div className='my_posts_or_features'>
            <div onClick={go_in_first} className='one_post_or_feature' style={{backgroundColor: in_first ? "rgb(1, 100, 100, 0.2)" : "white", cursor:"pointer"}}>
              <h5>My Posts</h5>
            </div>
            <div onClick={go_in_second} className='one_post_or_feature' style={{backgroundColor: !in_first ? "rgb(1, 100, 100, 0.2)" : "white", cursor:"pointer"}}>
              <h5>Features</h5>
            </div>
          </div>

          <div className='pre_posts_div' id="pre_posts_div">
            <div className='loading_my_posts' id="loading_my_posts"><i className='fa fa-spinner' style={{fontSize:"45px", color:"black"}}></i></div>
            <div className='my_posts_pics_div' id="my_posts_pics_div">
            </div>
          </div>
          <div className='features_div' id="features_div">
            <div className="one_feature_div">
              <div className='interests_show_div'><h5 id="interests_h5" style={{width:"fit-content", height:"fit-content", padding:"5px 0px", marginBottom:"5px", float:"left"}}>Interests: </h5>
                <span style={{float:"left"}} id="my_inte_show_span"></span>
              <h5 style={showing_inte_div ? {backgroundColor:"orange", color:"white"} : {backgroundColor:"greenyellow", color:"black"}} className='add_more_interests_btn' onClick={add_interests_div}> {showing_inte_div ? 'Hide' : 'Add Interests'} </h5></div>
              <form className='add_interests_div' id="add_interests_div" onSubmit={(e) => {e.preventDefault(); add_interest_btn()}}>
                <input type="text" className='input_tag_div' maxLength={30} id="input_tags_input" onChange={(e) => inputting_tag(e)} /> <div className='sep_inte'></div> <button type='submit' className='add_interest_btn' id='main_add_tag_btn' onClick={add_interest_btn}>Add</button>
              </form>
            </div>
            <div className="one_feature_div">
              <button className='logout_btn' type="submit" onClick={logout}> Logout <i className='fa fa-sign-out'></i> </button>
            </div>
          </div>
        </div>
      </div>
    )
}