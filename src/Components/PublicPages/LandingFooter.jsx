import React from 'react';

const LandingFooter = () => {
    return (
        <div className='w-full bg-white shadow-md flex p-4 mt-auto items-center justify-center'>
            <div>
                <p className='font-medium text-sm'>&copy; {new Date().getFullYear()} Sanna. All Rights Reserved</p>
            </div>

        </div>
    );
}

export default LandingFooter;
