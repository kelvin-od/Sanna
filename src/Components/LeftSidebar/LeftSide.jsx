import React, {useContext} from 'react'
import edu from "../../Assets/Images/educa.jfif"
// import Tooltip from 'react-tooltip';
// import { Avatar } from "@material-tailwind/react";
import avatar from "../../Assets/Images/avatar.avif"
import { AuthContext } from "../AppContext/AppContext";

const Leftside = () => {

const { user, userData } = useContext(AuthContext);


    return (
        <div className='flex flex-col h-screen bg-white pb-4 border-2 rounded-xl shadow-lg'>
            <div className='flex flex-col items-center relative'>
                <img className='h-24 w-full rounded-xl' src={edu} alt="edu" />

                <div className='absolute -bottom-8'>
                    <div>
                        <img className='size-md rounded-full h-20 w-20' src={avatar} alt="avatar" />
                    </div>
                </div>
            </div>

            <div className='flex flex-col items-center pt-12'>
                <p className='font-roboto font-medium text-md text-gray-600 no-underling tracking-normal leading-none'>
                {user?.name || userData?.name}
                </p>
                <p className='font-roboto text-sm text-gray-600 no-underling tracking-normal leading-none py-2'>
                    {user?.company || userData?.company}
                </p>
                <p className='font-roboto text-sm text-gray-600 no-underling tracking-normal leading-none mx-4 '>
                    Description of the company - Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo at neque sint aliquid? 
                    Amet iure cumque autem adipisci magnam, libero natus rem impedit pariatur, odio eligendi alias qui dolore quibusdam?
                </p>
            </div>

            <div className='flex items-center'>
                <img src="" alt="" />
            </div>


        </div>
    )
}

export default Leftside