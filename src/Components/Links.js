import React,{useEffect,useState} from 'react'
import LinksForm from './LinksForm';
import {db} from '../config/firebase'
const Links = () => {
const [links, setLinks] = useState([]);
const [currentId, setCurrentId] = useState('');
  const getLinks = async () =>{
      db.collection('Links').onSnapshot((querySnapshot)=>{
          const docs = [];
          querySnapshot.forEach((doc)=>{
              docs.push({...doc.data(),id:doc.id});
          });
          setLinks(docs)
      });
  };
  const onDeleteLink = async (id) =>{
      if(window.confirm("Seguro que deseas eliminar esto?")){
          await db.collection("Links").doc(id).delete();
      };
  };
  useEffect(()=>{
      getLinks()
  });
  const addOrEditLink = async(linkObject)=>{
      try {
          if(currentId === "") {
              await db.collection("Links").doc().set(linkObject);
              console.log(linkObject);
          } else {
              await db.collection("Links").doc(currentId).update(linkObject);
              setCurrentId("")
          }
      } catch (error){
        console.error(error)
      }
  }
    return (
        <>
        <div className="col-md-4 p-2">
        <LinksForm {...{addOrEditLink,currentId,links}}/>    
        </div>  
        <div className="col-md-8 p-2">
            {
                links.map((link)=>(
                    <div className="card mb-1" key={link.id}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <h4>{link.name}</h4>
                            
                            <div>
                            <button className="btn btn-danger" onClick={()=>onDeleteLink(link.id)}>close</button>
                            <button className="btn btn-success" onClick={()=>setCurrentId(link.id)}>Create</button>
                            </div>
                            </div>
                            <p>{link.description}</p>
                            <p>{link.url}</p>
                        </div>
                    </div>
                 
                ))
            }
        </div>
        </>
    )
}

export default Links
