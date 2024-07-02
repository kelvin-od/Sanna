import React, { useState, useContext, useRef } from "react";
import { AuthContext } from "../AppContext/AppContext";
import { db } from "../firebase/firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const AdvertSection = () => {
    const { user, userData } = useContext(AuthContext);
    const textRef = useRef(null); // Ref for the text input
    const [image, setImage] = useState(null);
    const [fileName, setFileName] = useState(""); // State to manage file name display
    const [retailPrice, setRetailPrice] = useState("");
    const [crossSalePrice, setCrossSalePrice] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [location, setLocation] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [progressBar, setProgressBar] = useState(0);
    const [file, setFile] = useState(null); // State to handle file upload

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file); // Set the selected file
            setImage(file);
            setFileName(file.name); // Set file name when file is selected
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = textRef.current.value.trim();

        if (!text || !retailPrice || !crossSalePrice || !expiryDate || !location || !businessName) {
            alert("Please fill all the fields");
            return;
        }

        try {
            let imageUrl = "";
            if (image) {
                const storageRef = ref(getStorage(), `images/${image.name}`);
                const uploadTask = uploadBytesResumable(storageRef, image);

                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        setProgressBar(progress);
                    },
                    (error) => {
                        console.error(error);
                        alert("Error uploading image");
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            imageUrl = downloadURL;
                            await addPost(text, imageUrl);
                        } catch (error) {
                            console.error(error);
                            alert("Error uploading image");
                        }
                    }
                );
            } else {
                await addPost(text, imageUrl);
            }
        } catch (err) {
            console.error("Error creating post: ", err);
            alert("Error creating post");
        }
    };

    const addPost = async (text, imageUrl) => {
        try {
            await addDoc(collection(db, "adverts"), {
                uid: user.uid,
                text,
                image: imageUrl,
                retailPrice,
                crossSalePrice,
                expiryDate,
                location,
                businessName,
                timestamp: serverTimestamp(),
            });
            // Clear form fields after successful post
            textRef.current.value = "";
            setImage(null);
            setFileName("");
            setRetailPrice("");
            setCrossSalePrice("");
            setExpiryDate("");
            setLocation("");
            setBusinessName("");
            setProgressBar(0);
            alert("Post created successfully");
        } catch (err) {
            console.error("Error creating post: ", err);
            alert("Error creating post");
        }
    };


    const calculateExpiryDays = () => {
        if (!expiryDate) return "";
        const currentDate = new Date();
        const selectedDate = new Date(expiryDate);
        const timeDifference = selectedDate.getTime() - currentDate.getTime();
        const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
        return daysDifference;
    };

    const submitImage = () => {
        // Placeholder function for handling image submission
        console.log("Submit image logic goes here");
        // You can implement further logic for handling the image submission
    };

    return (
        <div className="mt-16 flex flex-col">
            
            <form onSubmit={handleSubmit} className="new-post-form rounded-lg border border-gray-300 shadow-lg bg-white p-4 flex flex-col py-8">
            <div className="mb-2 text-xs text-gray-500">
                <p>Do you have products that are soon expiring, sell them off by filling this form </p>
            </div>
            <div className="w-full flex">
                    <textarea
                        className="outline-none w-full bg-white rounded-md font-normal text-sm border border-gray-300 p-2"
                        type="text"
                        placeholder={`What are you cross-selling today? ${user?.displayName?.split(" ")[0] || userData?.name?.charAt(0).toUpperCase() + userData?.name?.slice(1)}`}
                        ref={textRef} // Connect the ref to the input element
                    />
                </div>
                <div className="mx-4">
                    {image && (
                        <img
                            className="h-24 rounded-xl"
                            src={URL.createObjectURL(image)}
                            alt="previewImage"
                        />
                    )}
                </div>

                <div className="flex items-center justify-center mt-4">
                    <div>
                        <label htmlFor="upload" className="cursor-pointer items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75" />
                            </svg>
                            <input id="upload" type="file" style={{ display: 'none' }} onChange={handleImageChange} />
                        </label>
                    </div>
                    {file && (<button onClick={submitImage}>Upload</button>)}
                </div>


                <input
                    className="text-sm p-2 border rounded-lg my-2"
                    type="number"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    placeholder="Retail Price"
                    required
                />
                <input
                    className="text-sm p-2 border rounded-lg my-2"
                    type="number"
                    value={crossSalePrice}
                    onChange={(e) => setCrossSalePrice(e.target.value)}
                    placeholder="Cross-Sale Price"
                    required
                />
                <input
                    className="text-sm p-2 border rounded-lg my-2"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                />

                <input
                    className="text-sm p-2 border rounded-lg my-2"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Business Name"
                    required
                />

                <input
                    className="text-sm p-2 border rounded-lg my-2"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location"
                    required
                />

                <div className="flex items-center my-2">
                    <span className="text-sm mr-2">Expiry in days:</span>
                    <span className="font-bold">{calculateExpiryDays()}</span>
                </div>

                <button
                    className="border p-1 rounded-lg border-green-500"
                    type="submit"
                >
                    Post
                </button>
            </form>
            <div style={{ width: `${progressBar}%` }} className="bg-blue-700 py-1 rounded-md"></div>
        </div>
    );
};

export default AdvertSection;
