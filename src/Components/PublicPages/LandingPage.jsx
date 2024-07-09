import React from "react"
import NavigationBar from "./NavigationBar"
import Hero from "./Hero"
import Testimonial from "./Testimonial"
import LandingFooter from "./LandingFooter";


const LandingPage = () => {

    return (
        <div>
            <NavigationBar />
            <Hero />
            <Testimonial />
            <LandingFooter />
        </div>
    )
};


export default LandingPage;