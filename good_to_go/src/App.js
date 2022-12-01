import './App.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './Pages/Login';
import All_content from './Pages/All_content';
import New_Post from './Pages/New_post';
import Profile from './Pages/Profile';
import Requests, { show_all_noti } from './Pages/Requests';
import Search from './Pages/Search';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ShowLikes from './Pages/Likes_page';
import { useParams } from 'react-router-dom';
import ShowComments from './Pages/Comments_page';
import RequestStatus from './Pages/RequestStatus';
import Post_view from './Pages/Post_view';
import { doc, onSnapshot } from 'firebase/firestore';
import { database } from './firebaseConfig';
import { ring_the_bell } from './Pages/Navbar';
import ShowPeople, { show_people } from './Pages/ShowPeople';

export var show_new_content = true
export var set_it_false = () => {
  show_new_content = false
}
export let new_noti_fun = () => {}

export let sr = null
export let sf = null

export let set_sr = (data, searched_for) => {
  sr = data
  sf = searched_for
}

export let my_img = ""

export let set_my_img = (new_img) => {
  my_img = new_img
}

function App() {

  const auth = getAuth();
  const uid = localStorage.getItem("uid")
  const nav_to = useNavigate()
  set_my_img(localStorage.getItem(uid+"image"))

  onAuthStateChanged(auth, (user) => {
      if (user != null) {
        localStorage.setItem('rem_me', "y");
      } else {
        if(window.location.pathname !== "/")
          nav_to("/")
          return
      }
    });

    new_noti_fun = async() => {
      if(uid !== null){
        await onSnapshot(doc(database, 'Notifications', localStorage.getItem(uid+"email")), async(qs) => {
          try{
            if(qs.data().new === true){
              localStorage.setItem("noti_data_main", JSON.stringify(qs.data()))
              localStorage.setItem("are_new_noti", "y")
              ring_the_bell()
              show_all_noti()
              show_people(qs.data())
            }
          }catch{}
        })
      }
    }

    new_noti_fun()

    return (
          <div>
            <Routes>
                <Route path='/' element={<LoginPage/>} />
                <Route path='/home' element={<HomePage/>} />
                <Route path='/profile' element={<ProfilePage/>} />
                <Route path='/requests' element={ <RequestsPage/>} />
                <Route path='/search' element={ <SearchPage/>} />
                <Route path='/new_post' element={ <NewPostPage/>} />
                <Route path='/search/:post_id' element={<ShowSearchedPost/>}/>
                <Route path='/connect/:noti_id' element={<ShowNotiPost/>}/>
                <Route path='/request/:post_id' element={<ShowRequestStatus/>}/>
                <Route path='/likes/:post_id' element={<ShowLikesPage/>}/>
                <Route path='/comments/:post_id' element={<ShowCommentsPage/>}/>
                <Route path='/post/:post_id' element={<ShowPostView/>}/>
                <Route path='*' element={ <ErrorPage/> } />
            </Routes>
          </div>
  );
}

function LoginPage(){
  return(
    Login()
  )
}

function ShowNotiPost(){
  let { noti_id } = useParams();
  return(
    ShowPeople(noti_id)
  )
}

function ShowSearchedPost(){
  let { post_id } = useParams();
  return(
    Search(post_id)
  )
}

function ShowPostView(){
  let { post_id } = useParams();
  return(
    Post_view(post_id)
  )
}

function ShowRequestStatus(){
  let { post_id } = useParams();
  return(
    RequestStatus(post_id)
  )
}

function ShowLikesPage() {
  let { post_id } = useParams();
  return(
    ShowLikes(post_id)
  )
}

function ShowCommentsPage() {
  let { post_id } = useParams();
  return(
    ShowComments(post_id)
  )
}

function HomePage(){
  return(All_content())
}

function NewPostPage(){
    return(New_Post())
}

function ProfilePage(){
    return(Profile())
}

function RequestsPage(){
    return(Requests())
}

function SearchPage(){
    return(Search())
}

function ErrorPage(){
  return(
    Login()
  )
}



export default App;
