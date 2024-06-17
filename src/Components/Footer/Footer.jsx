import React from 'react'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';


const Footer = () => {
    return (
        <div className='flex justify-center items-center border-t'>
            <div className=' flex h-auto py-3 gap-4 items-center mr-8'>
                <p className='font-medium text-xs'>&copy; {new Date().getFullYear()} Sanna. All Rights Reserved</p>
                <span><a href="#" className='text-xs'>Terms & Conditions</a></span>
                <span><a href="#" className='text-xs'>Privacy Policy</a></span>
                <span><a href="#" className='text-xs'>Our Blog</a></span>
            </div>
            <div className=' flex h-auto py-3 gap-3 items-center ml-24'>
                <p className='font-medium text-xs'>Let's connect on our social media</p>
                <span><a className='hover:text-green-200' href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                    <FaFacebook />
                </a></span>
                <span><a className='hover:text-green-200' href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                    <FaLinkedin />
                </a></span>
                <span><a className='hover:text-green-200' href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                    <FaTwitter />
                </a></span>
                <span><a className='hover:text-green-200' href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                    <FaInstagram />
                </a></span>
            </div>
        </div>
    )
}

export default Footer
