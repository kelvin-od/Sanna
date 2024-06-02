import React from "react"
import avatar from "../../Assets/Images/avatar.avif"
import addImage from "../../Assets/Images/addImage.png"
import like from "../../Assets/Images/like.jpg";
import comment from "../../Assets/Images/comment.png";
import remove from  "../../Assets/Images/remove.png";

const PostCard = ({ uid, id, logo, name, email, text, image, timestamp }) => {
    return (
        <div className="mb-4">
            <div className="flex flex-col py-4 bg-white rounded-t-3xl">
                <div className="flex items-center py-4 ml-2">
                    <img className="w-20 h-20 rounded-full" src={avatar} alt="avatar" />
                    <div className="flex flex-col">
                        <p className="ml-4 py-2 font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none">
                            {email}
                        </p>
                        <p className="ml-4 font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none">
                            published: {timestamp}
                        </p>
                    </div>
                    {/* Add friend image */}
                </div>
                <div className="ml-4 pb-4 font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none">
                    <p>
                        {text}
                        </p>
                        {image && (<img className="h-[500px] w-full" src={image} alt="postImage" />) }
                </div>
                <div className="flex justify-round items-center pt-4">
                    <button className="flex items-center cursor-pointer rounded-lg p-2 hover:bg-gray-100">
                        <img className="h-8 mr-4" src={like} alt="like" />
                        {/* display likes */}
                    </button>
                    <div className="flex justify-round items-center pt-4">
                        <div className="flex items-center cursor-pointer">
                            <img className="h-8 mr-4" src={comment} alt="comment" />
                            <p className="font-roboto font-medium text-medium text-gray-700 no-underline tracking normal leading-none">
                                Comments
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <img className="h-8 mr-4" src={remove} alt="delete" />
                        <p className="font-roboto font-medium text-medium text-gray-700 no-underline tracking normal leading-none">Delete</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PostCard