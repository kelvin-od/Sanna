import React from "react";
import farmer from "../../Assets/Images/farmer.jpg";
import impact from "../../Assets/Images/impact.jpg";

const Testimonial = () => {
    return (
        <div className="h-auto flex flex-col">
            {/* Testimonial 1 */}
            <div className="flex flex-col lg:flex-row w-full">
                <div className="lg:flex-1">
                    <img className="testimonial-img hover:scale-105 hover:brightness-110 transition duration-300 ease-in-out" src={farmer} alt="farmer" />
                </div>
                <div className="lg:flex-1 bg-green-500">
                    <h2 className="text-xl text-white px-8 mt-12 lg:mt-0">Meet Christopher - CEO at Guru Agribusiness</h2>
                    <p className="text-lg font-bold text-white p-8">Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere delectus cum, eaque commodi laborum quidem veniam ad quaerat.</p>
                </div>
            </div>

            {/* Testimonial 2 */}
            <div className="flex flex-col-reverse lg:flex-row w-full">
                <div className="lg:flex-1 bg-black pb-8">
                    <h2 className="text-lg text-white p-8 lg:p-16">Over 60% of Agricultural Chemicals go into waste. We have helped you Reduce the Wastage</h2>
                    <button className="flex items-center gap-2 px-8 lg:px-16 py-4 text-lg text-white border rounded-full ml-8 lg:ml-16 hover:scale-105">
                        <span>Learn More</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                        </svg>
                    </button>
                </div>
                <div className="lg:flex-1">
                    <img className="testimonial-img hover:brightness-110 transition duration-300 ease-in-out" src={impact} alt="impact" />
                </div>
            </div>
        </div>
    );
}

export default Testimonial;
