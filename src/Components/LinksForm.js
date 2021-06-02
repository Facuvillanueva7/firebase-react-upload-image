import React, { useEffect, useState } from "react";
import { db, storage } from "../config/firebase";

const LinksForm = (props) => {
  const initialStateValues = {
    url: "",
    name: "",
    description: "",
  };

  const [values, setValues] = useState(initialStateValues);
  const [file, setFile] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const types = ["image/png", "image/jpeg"];

  const linkImgHandler = (e) => {
    let selectedFile = e.target.files[0];

    if (selectedFile && types.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      setFile(null);
      throw new Error("incorrect_file_type");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const obj = values;

    obj[name] = value;
  };

  const validURL = (str) => {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    );

    return !!pattern.test(str);
  };

  const addOrEditLink = async (linkObject) => {
    try {
      if (props.currentId)
        return await db
          .collection("Links")
          .doc(props.currentId)
          .update(linkObject);

      await db
        .collection("Links")
        .doc()
        .set(linkObject)
        .then(() => {
          console.log("Document successfully written!");
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        });
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validURL(values.url)) return console.log("Invalid url");

    const LinkImg = storage.ref(`Links-images/${file.name}`).put(file);

    LinkImg.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        setIsLoading(progress !== 100);
      },
      () => {},
      async () => {
        const url = await storage
          .ref("Links-images")
          .child(file.name)
          .getDownloadURL();

        addOrEditLink({ ...values, LinkImg: url });
      }
    );
  };

  const getLinkById = async (id) => {
    if (!id) return;

    const doc = await db.collection("Links").doc(id.toString()).get();
    setValues({ ...doc.data() });
  };

  useEffect(() => {
    if (props.currentId !== " ") {
      getLinkById(props.currentId);
    }
  }, [props.currentId]);

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
          />
        </div>

        <input
          type="file"
          placeholder="Sube una imagen"
          onChange={linkImgHandler}
        />

        <button className="btn btn-primary btn-block" disabled={isLoading}>
          {props.currentId === "" ? "Save" : "Update"}
        </button>
      </form>
    </div>
  );
};

export default LinksForm;
