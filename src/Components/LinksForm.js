/* eslint-disable react-hooks/exhaustive-deps */
import React,{useState,useEffect} from 'react'
import {db,storage} from '../config/firebase'
const LinksForm = (props) => {
    const initialStateValues = {
        url:'',
        name: '',
        description:'',
        ImgUrl:""
    };
    const [values,setValues] = useState(initialStateValues)
    const [linkImg,setLinkImg] = useState('')
    const types = ['image/png','image/jpeg'];
    const linkImgHandler = (e)=>{
        let selectedFile = e.target.files[0];
        if(selectedFile && types.includes(selectedFile.type)){
            setLinkImg(selectedFile)
            
        }else{
            setLinkImg(null)

        }
    }
    
    const handleInputChange = (e)=>{
        const {name, value}= e.target;
        setValues({...values,[name]:value,ImgUrl:linkImg})
        console.log(linkImg);
    }
    const validURL = (str) => {
        var pattern = new RegExp(
          "^(https?:\\/\\/)?" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
            "(\\#[-a-z\\d_]*)?$",
          "i"
        ); // fragment locator
        return !!pattern.test(str);
      };
    const handleSubmit = (e)=>{
        e.preventDefault()
        if(!validURL(values.url)){
            return console.log("Invalid url");
        } 
        props.addOrEditLink(values)
        setValues({...initialStateValues})
        const UploadImg = ()=>{
            console.log(linkImg);
            const LinkImg = storage.ref(`Links-images/${linkImg.name}`).put(linkImg)
            LinkImg.on('state_changed',snapshot=>{
                const progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
                console.log(progress);
            },()=>{
                storage.ref("Links-images").child(LinkImg.name).getDownloadURL(URL).then(url=>{
                    setLinkImg(URL)
                    console.log(url);
                })
            })
        }
        return UploadImg()
       
    }
     const getLinkById = async (id)=>{
        const doc = await db.collection("Links").doc(toString(id)).get();
        setValues({...doc.data()});
    };  
    useEffect(()=>{
        if(props.currentId === " "){
            setValues({...initialStateValues})
        }else{
             getLinkById(props.currentId)  
        }
         
    },[props.currentId])
    return (
        <div>
             <form onSubmit={handleSubmit} className="card card-body border-primary">
      <div className="form-group input-group">
        <div className="input-group-text bg-light">
          <i className="material-icons">insert_link</i>
        </div>
        <input
          type="text"
          className="form-control"
          placeholder="https://someurl.xyz"
          value={values.url}
          name="url"
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group input-group">
        <div className="input-group-text bg-light">
          <i className="material-icons">create</i>
        </div>
        <input
          type="text"
          value={values.name}
          name="name"
          placeholder="Website Name"
          className="form-control"
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <textarea
          rows="3"
          className="form-control"
          placeholder="Write a Description"
          name="description"
          value={values.description}
          onChange={handleInputChange}
        ></textarea>
      </div>
        <input 
        type="file" 
        name="LinkImg"
        value={values.LinkImgUrl}
        placeholder="Sube una imagen" 
        onChange={linkImgHandler}/>
      <button className="btn btn-primary btn-block">
        {props.currentId === "" ? "Save" : "Update"}
      </button>
    </form>
        </div>
    )
}

export default LinksForm
