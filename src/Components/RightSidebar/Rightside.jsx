import React, {useState } from 'react'
import edu from "../../Assets/Images/educa.jfif"

const Rightside = () => {

    const [input, setInput] = useState('')


  return (
    <div className='flex flex-col bg-white shadow-lg border-2 rounded-xl h-screen'>
      <div className='flex flex-col items-center relative pt-5'>
        <img className='h-28 rounded-md' src={edu} alt="edu" />
      </div>
      <p className='font-roboto font-normal text-sm text-gray-700 max-m-fit no-underline tracking-normal leading-tight py-2 mx-2'>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolore sit praesentium voluptas natus quam voluptates animi quia sapiente nihil quas velit, 
        autem illo facilis reiciendis perspiciatis, ipsam tenetur fugiat accusantium.
      </p>

      <div className='mx-2 mt-10'>
        <p className='font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none'>
            Networks:
        </p>
        <input 
        className='border-0 outline-none mt-4 bg-green-100 py-2 px-3'
        name='input'
        value={input}
        type="text" 
        placeholder='Search Agribusinesses/Networks' 
        onChange={(e) => setInput(e.target.value)}/>
        
      </div>
    </div>
  )
}

export default Rightside