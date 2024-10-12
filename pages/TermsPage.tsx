import React, {useContext, useEffect, useState} from "react"
import TitleBar from "../components/TitleBar"
import NavBar from "../components/NavBar"
import SideBar from "../components/SideBar"
import Footer from "../components/Footer"
import tos from "../assets/icons/tos.png"
import privacy from "../assets/icons/privacy.png"
import DragAndDrop from "../components/DragAndDrop"
import functions from "../structures/Functions"
import {HideNavbarContext, HideSidebarContext, ThemeContext, RelativeContext, HideTitlebarContext, HeaderTextContext, 
SidebarTextContext, MobileContext, EnableDragContext, SiteHueContext, SiteLightnessContext, SiteSaturationContext} from "../Context"
import "./styles/tospage.less"

const TermsPage: React.FunctionComponent = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {siteHue, setSiteHue} = useContext(SiteHueContext)
    const {siteSaturation, setSiteSaturation} = useContext(SiteSaturationContext)
    const {siteLightness, setSiteLightness} = useContext(SiteLightnessContext)
    const {hideNavbar, setHideNavbar} = useContext(HideNavbarContext)
    const {hideTitlebar, setHideTitlebar} = useContext(HideTitlebarContext)
    const {hideSidebar, setHideSidebar} = useContext(HideSidebarContext)
    const {enableDrag, setEnableDrag} = useContext(EnableDragContext)
    const {relative, setRelative} = useContext(RelativeContext)
    const {headerText, setHeaderText} = useContext(HeaderTextContext)
    const {sidebarText, setSidebarText} = useContext(SidebarTextContext)
    const {mobile, setMobile} = useContext(MobileContext)
    const [onPrivacy, setOnPrivacy] = useState(false)

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    useEffect(() => {
        setHideNavbar(true)
        setHideTitlebar(true)
        setHideSidebar(false)
        setRelative(false)
        setHeaderText("")
        setSidebarText("")
        window.scrollTo(0, 0)
    }, [])

    useEffect(() => {
        if (mobile) {
            setRelative(true)
        } else {
            setRelative(false)
        }
    }, [mobile])

    useEffect(() => {
        if (onPrivacy) {
            document.title = "Privacy Policy"
        } else {
            document.title = "Terms of Service"
        }
    })
    
    return (
        <>
        <DragAndDrop/>
        <TitleBar/>
        <NavBar/>
        <div className="body">
            <SideBar/>
            <div className="content" onMouseEnter={() => setEnableDrag(true)}>
                <div className="terms-container">
                    <div className="terms">
                        <div className="terms-title-container">
                            <img className="terms-img" src={tos} style={{filter: getFilter()}}/>
                            <span className="terms-title">Terms of Service</span>
                        </div>
                        <div className="terms-text">
                            Last Updated: March 31, 2024 <br/><br/>

                            This terms of service applies to the website ("site") provided 
                            by Moepictures ("we", "us", "our"). By using our site, you agree to all of these terms. If you don't agree with these 
                            terms you should not use our site.<br/><br/>

                            Access to the site<br/>
                            <span className="terms-text-alt">
                            ⇾ You must be 18 or older or otherwise above the age of majority in your country of residence to create an account on our site.<br/>
                            ⇾ Your account could be terminated at any time for any or no reason, including but not limited to 
                            a violation of the terms of service.<br/><br/>
                            </span>

                            Prohibited actions<br/>
                            When you are using our site, you may not do any of the following: <br/>
                            <span className="terms-text-alt">
                            ⇾ Vandalize posts, tags, or translations. <br/>
                            ⇾ Send spam in the comments or through unsolicited private messages. <br/>
                            ⇾ Robotically scrape artworks, tags, or any other site content. <br/>
                            ⇾ Attempt to gain unauthorized access to another user’s account. <br/>
                            ⇾ Sell access to your user account to someone else. <br/>
                            ⇾ Create multiple accounts to circumvent bans. <br/>
                            ⇾ Attempt to upload malware or other malicious content. <br/>
                            ⇾ Attempt to disrupt the operation of our servers. <br/><br/>
                            </span>

                            User-generated content<br/>
                            <span className="terms-text-alt">
                            ⇾ All of the content on our site is user-generated and we take no responsibility
                            for content submitted by users, whether it be images, animations, videos, or text, 
                            the responsibility falls on the user who submitted the content. <br/>
                            ⇾ We reserve the right to remove content at any time and for any reason. <br/><br/>
                            </span>

                            Copyright and DMCA takedowns<br/>
                            We respect the intellectual property of others. If you are an artist and want your 
                            works removed from the site, you can contact us through the copyright removal form 
                            and provide the following pieces of information:<br/>
                            <span className="terms-text-alt">
                            ⇾ Your name, artist tag, and links to specific works or your artist tag page.<br/>
                            ⇾ A way to prove that you are the artist in question.<br/>
                            </span>
                            These are some acceptable forms of proof:<br/>
                            <span className="terms-text-alt">
                            ⇾ If your email is publicly listed on your accounts, contact us using that email. Post the link of where your email is listed. <br/>
                            ⇾ Post somewhere on your profile or in one of your posts "Remove me from Moepictures" and post the link to it. <br/>
                            ⇾ Attach a source file (.psd, .clip) to one of your works which isn't released publicly. <br/>
                            </span><br/>

                            Account Upgrades<br/>
                            <span className="terms-text-alt">
                            ⇾ You may submit payment information to purchase an account upgrade on our site. All of your payment information 
                            is handled solely by the third-party payment processor. We reserve the right to change the price or benefits of the 
                            upgrade at any point with advanced notice. <br/><br/>
                            </span>

                            Liability<br/>
                            The site is provided "as is", without warranty of any kind, express or implied. 
                            In no event shall we be liable for any claim, damages or other liability, arising from 
                            or in connection with usage of our site.<br/><br/>

                            Changes to these terms<br/>
                            We can make changes to these terms at any time, indicated by the  
                            “last updated” date. Changes to the terms are effective immediately and by using
                            our site after the terms are revised you agree to the newly revised terms.
                        </div>
                    </div>
                    <div className="privacy" id="privacy" onMouseOver={() => setOnPrivacy(true)} onMouseLeave={() => setOnPrivacy(false)}>
                        <div className="privacy-title-container">
                            <img className="privacy-img" src={privacy} style={{filter: getFilter()}}/>
                            <span className="privacy-title">Privacy Policy</span>
                        </div>
                        <div className="privacy-text">
                            Last Updated: March 31, 2024<br/><br/>

                            This Privacy Policy outlines the information that Moepictures ("we", "us", "our") 
                            collects when you use our website ("site"). It
                            also describes how we use your information and how your information is shared. <br/><br/>

                            Collected information<br/>
                            We collect information provided directly to us, which includes:<br/><br/>

                            <span className="privacy-text-alt">Account information</span> - We need to store your 
                            username, email, password, bio, ip address, and any account preferences.<br/><br/>

                            <span className="privacy-text-alt">Content you submit</span> - We collect any content that you submit which may include
                            text, images, gifs, videos, posts and comments. <br/><br/>

                            <span className="privacy-text-alt">Actions you take</span> - We collect information on the interactions that you make with the 
                            content, such as favoriting posts or rating them.<br/><br/>

                            <span className="privacy-text-alt">Cookies</span> - Cookies are used to maintain your
                            login session.<br/><br/>

                            How we use your information<br/>
                            We use your information in order to:<br/>
                            <span className="privacy-text-alt">
                            ⇾ Provide our site's functionality.<br/>
                            ⇾ Protect our site from abuse and spam.<br/><br/>
                            </span>

                            How information about you is shared<br/>
                            <span className="privacy-text-alt">
                            ⇾ Unless stated otherwise, any content that you submit to our site is
                            visible to the public. <br/>
                            ⇾ You can choose to make certain information private, such as 
                            your favorites. <br/><br/>
                            </span>

                            We do not share personal information with third parties unless one of
                            the following is true:<br/>
                            <span className="privacy-text-alt">
                            ⇾ We have your consent.<br/>
                            ⇾ It is aggregated and anomalyzed in a way that can’t be traced back to you.<br/>
                            ⇾ It is required to comply with the law.<br/><br/>
                            </span>

                            Controlling your information<br/>
                            <span className="privacy-text-alt">Changing your information</span> - You can update your information, 
                            such as your email and password anytime in your account settings.<br/><br/>

                            <span className="privacy-text-alt">Deleting your account</span> - You can delete your account in your account
                            settings. When you delete your account all of your personal information is deleted. Your public contributions, 
                            such as posts, will not be deleted. Your contributions will however get disconnected from your username. <br/><br/>

                            Changes to this policy<br/>
                            We can make changes to this policy at any time, indicated by its
                            “last updated” date. Changes to this policy are effective immediately
                            and by continuing to use our site after the policy is revised, you
                            are agreeing to the revised policy.
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>
        </div>
        </>
    )
}

export default TermsPage