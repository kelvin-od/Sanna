import React from 'react'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';


const Footer = () => {
    return (
        <div className='flex flex-col justify-center items-center border-t py-2 mt-4'>
            <p className='font-medium text-xs'>&copy; {new Date().getFullYear()} Sanna. All Rights Reserved</p>
            <div className=' flex justify-center h-auto py-1 items-center'>
                
                <span><a href="#" className='text-xs mr-2 text-gray-600'>Terms & Conditions</a></span>
                <span><a href="#" className='text-xs mr-2 text-gray-600'>Privacy Policy</a></span>
                <span><a href="#" className='text-xs text-gray-600'>Our Blog</a></span>
            </div>
            {/* <div className=' flex justify-center h-auto  items-center gap-4'>
                <p className='font-medium text-xs'>Let's connect</p>
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
            </div> */}
        </div>
    )
}

export default Footer
