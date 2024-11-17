import React, { useState, useEffect } from "react";
import { storage, db } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./ManageMaterialsModal.css";

const ManageMaterialsModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [materials, setMaterials] = useState([]);

  const handleFileUpload = () => {
    if (!file) {
      alert("No file selected!");
      return;
    }
    const storageRef = ref(storage, `promotional-materials/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        alert("Failed to upload file!");
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          await addDoc(collection(db, "promotional-materials"), {
            name: file.name,
            url: downloadURL,
          });
          alert("File uploaded successfully!");
          fetchMaterials(); // Refresh materials
          setFile(null);
          setUploadProgress(0);
        } catch (error) {
          console.error("Error saving file metadata:", error);
        }
      }
    );
  };

  const fetchMaterials = async () => {
    const querySnapshot = await getDocs(collection(db, "promotional-materials"));
    const materialsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMaterials(materialsList);
  };

  const handleDelete = async (id, fileName) => {
    const fileRef = ref(storage, `promotional-materials/${fileName}`);
    try {
      await deleteObject(fileRef); // Delete from storage
      await deleteDoc(doc(db, "promotional-materials", id)); // Delete from Firestore
      alert("Material deleted successfully!");
      fetchMaterials(); // Refresh materials
    } catch (error) {
      console.error("Error deleting material:", error);
      alert("Failed to delete material!");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMaterials();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Manage Promotional Materials</h2>
        <div className="upload-section">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/*"
          />
          <button onClick={handleFileUpload}>Upload</button>
          {uploadProgress > 0 && (
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${uploadProgress}%` }}
              >
                {Math.round(uploadProgress)}%
              </div>
            </div>
          )}
        </div>
        <div className="materials-list">
          <h3>Uploaded Materials</h3>
          {materials.map((material) => (
            <div key={material.id} className="material-item">
              <img src={material.url} alt={material.name} className="material-thumbnail" />
              <p>{material.name}</p>
              <button
                onClick={() => handleDelete(material.id, material.name)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </div>
  );
};

export default ManageMaterialsModal;
