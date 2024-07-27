import React from "react"
import NavigationBar from "./NavigationBar"
import Hero from "./Hero"
// import Testimonial from "./Testimonial"
import LandingFooter from "./LandingFooter";
import { Helmet } from 'react-helmet';


const LandingPage = () => {

    return (
        <><Helmet>
            <title>Sanna</title>
        </Helmet>
            <div className="bg-white">
                <NavigationBar />
                <Hero />
                {/* <Testimonial /> */}
                <LandingFooter />
            </div>
        </>
    )
};


export default LandingPage;