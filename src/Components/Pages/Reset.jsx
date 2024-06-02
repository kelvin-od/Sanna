import React, { useState } from 'react'

const Reset = () => {

    const [email, setEmail] = useState("")

  return (
    <div className="grid text-center justify-center h-screen items-center p-8 ">
        <div className='w-96'>
            <h6 className='pb-4 text-black'>
                Enter the Email Address associated with your Account and We'll send you a link to reset your password
            </h6>
        <input 
        className='border-2 border-black-100 w-full p-2'
        type="email" 
        label="Email" 
        placeholder='name@mail.com' 
        value={email}
        onChange={(e) => setEmail(e.target.value)} />
        <button className='w-full mt-4 text-md bg-blue-700 rounded-lg shadow-lg py-3 text-white'>
            Reset Password
        </button>
        </div>
    </div>
  )
}

export default Reset
