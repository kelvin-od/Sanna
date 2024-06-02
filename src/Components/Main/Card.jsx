import React from 'react'

const Card = ({ name, img, status }) => {
    return (
        <div>
            <div className='relative'>
                <img className='h-80 w-56 rounded-2xl hover:scale-105 duration-700 ease-in-out cursor-pointer shadow-lg' src={img} alt="name" />
                <p className='font-roboto absolute bottom-4 left-4 text-sm font-medium text-black no-underline leading-none'>
                    {name}
                </p>
                <p className={`absolute right-0 mr-4 bottom-4 text-sm font-medium no-underline leading-none ${status.toLowerCase() === "offline" ? "text-red-700 font-roboto" : "text-green-600 font-roboto"}`}>
                    {status}</p>
            </div>
        </div>
    )
}

export default Card