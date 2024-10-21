import React, {useContext, useEffect, useState} from "react"
import {useHistory} from "react-router-dom"
import {ThemeContext, SearchContext, SearchFlagContext, SessionContext, SessionFlagContext, SiteHueContext, SiteLightnessContext, SiteSaturationContext} from "../Context"
import {HashLink as Link} from "react-router-hash-link"
import approve from "../assets/icons/approve.png"
import reject from "../assets/icons/reject.png"
import functions from "../structures/Functions"
import cryptoFunctions from "../structures/CryptoFunctions"
import "./styles/modposts.less"

const ModTranslations: React.FunctionComponent = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {siteHue, setSiteHue} = useContext(SiteHueContext)
    const {siteSaturation, setSiteSaturation} = useContext(SiteSaturationContext)
    const {siteLightness, setSiteLightness} = useContext(SiteLightnessContext)
    const [hover, setHover] = useState(false)
    const {search, setSearch} = useContext(SearchContext)
    const {searchFlag, setSearchFlag} = useContext(SearchFlagContext)
    const {session, setSession} = useContext(SessionContext)
    const {sessionFlag, setSessionFlag} = useContext(SessionFlagContext)
    const [unverifiedTranslations, setUnverifiedTranslations] = useState([]) as any
    const [index, setIndex] = useState(0)
    const [visibleTranslations, setVisibleTranslations] = useState([]) as any
    const [updateVisibleTranslationFlag, setUpdateVisibleTranslationFlag] = useState(false)
    const [offset, setOffset] = useState(0)
    const [ended, setEnded] = useState(false)
    const [imagesRef, setImagesRef] = useState([]) as any
    const history = useHistory()

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    const updateTranslations = async () => {
        const translations = await functions.get("/api/translation/list/unverified", null, session, setSessionFlag)
        setEnded(false)
        setUnverifiedTranslations(translations)
    }

    useEffect(() => {
        updateTranslations()
    }, [session])

    const updateVisibleTranslations = () => {
        const newVisibleTranslations = [] as any
        for (let i = 0; i < index; i++) {
            if (!unverifiedTranslations[i]) break
            newVisibleTranslations.push(unverifiedTranslations[i])
        }
        setVisibleTranslations(functions.removeDuplicates(newVisibleTranslations))
    }

    useEffect(() => {
        if (updateVisibleTranslationFlag) {
            updateVisibleTranslations()
            setUpdateVisibleTranslationFlag(false)
        }
    }, [unverifiedTranslations, index, updateVisibleTranslationFlag])

    const approveTranslation = async (translationID: number, username: string, postID: number) => {
        await functions.post("/api/translation/approve", {translationID, username, postID}, session, setSessionFlag)
        await updateTranslations()
        setUpdateVisibleTranslationFlag(true)
    }

    const rejectTranslation = async (translationID: number, username: string, postID: number) => {
        await functions.post("/api/translation/reject", {translationID, username, postID}, session, setSessionFlag)
        await updateTranslations()
        setUpdateVisibleTranslationFlag(true)
    }

    useEffect(() => {
        let currentIndex = index
        const newVisibleTranslations = visibleTranslations as any
        for (let i = 0; i < 10; i++) {
            if (!unverifiedTranslations[currentIndex]) break
            newVisibleTranslations.push(unverifiedTranslations[currentIndex])
            currentIndex++
        }
        setIndex(currentIndex)
        setVisibleTranslations(functions.removeDuplicates(newVisibleTranslations))
        const newImagesRef = newVisibleTranslations.map(() => React.createRef()) as any
        setImagesRef(newImagesRef) as any
    }, [unverifiedTranslations])

    const updateOffset = async () => {
        if (ended) return
        const newOffset = offset + 100
        const result = await functions.get("/api/translation/list/unverified", {offset: newOffset}, session, setSessionFlag)
        if (result?.length >= 100) {
            setOffset(newOffset)
            setUnverifiedTranslations((prev: any) => functions.removeDuplicates([...prev, ...result]))
        } else {
            if (result?.length) setUnverifiedTranslations((prev: any) => functions.removeDuplicates([...prev, ...result]))
            setEnded(true)
        }
    }

    useEffect(() => {
        const scrollHandler = async () => {
            if (functions.scrolledToBottom()) {
                let currentIndex = index
                if (!unverifiedTranslations[currentIndex]) return updateOffset()
                const newTranslations = visibleTranslations as any
                for (let i = 0; i < 10; i++) {
                    if (!unverifiedTranslations[currentIndex]) return updateOffset()
                    newTranslations.push(unverifiedTranslations[currentIndex])
                    currentIndex++
                }
                setIndex(currentIndex)
                setVisibleTranslations(functions.removeDuplicates(newTranslations))
            }
        }
        window.addEventListener("scroll", scrollHandler)
        return () => {
            window.removeEventListener("scroll", scrollHandler)
        }
    })

    const translationDataJSX = (translation: any) => {
        let jsx = [] as any
        for (let i = 0; i < translation.data.length; i++) {
            const item = translation.data[i]
            jsx.push(<span className="mod-post-text">{`${item.transcript} -> ${item.translation}`}</span>)
        }
        return jsx
    }

    const generateTranslationsJSX = () => {
        let jsx = [] as any
        const translations = functions.removeDuplicates(visibleTranslations)
        if (!translations.length) {
            return (
                <div className="mod-post" style={{justifyContent: "center", alignItems: "center", height: "75px"}} 
                onMouseEnter={() =>setHover(true)} onMouseLeave={() => setHover(false)} key={0}>
                    <div className="mod-post-text-column">
                        <span className="mod-post-text">No data</span>
                    </div>
                </div>
            )
        }
        for (let i = 0; i < translations.length; i++) {
            const translation = translations[i] as any
            if (!translation) break
            const imgClick = (event?: any, middle?: boolean) => {
                if (middle) return window.open(`/unverified/post/${translation.postID}`, "_blank")
                history.push(`/unverified/post/${translation.postID}`)
            }
            const img = functions.getUnverifiedThumbnailLink(translation.post.images[0].type, translation.postID, translation.post.images[0].order, translation.post.images[0].filename, "tiny")
            jsx.push(
                <div className="mod-post" onMouseEnter={() =>setHover(true)} onMouseLeave={() => setHover(false)}>
                    <div className="mod-post-img-container">
                        {functions.isVideo(img) ? 
                        <video className="mod-post-img" src={img} onClick={imgClick} onAuxClick={(event) => imgClick(event, true)}></video> :
                        <img className="mod-post-img" src={img} onClick={imgClick} onAuxClick={(event) => imgClick(event, true)}/>}
                    </div>
                    <div className="mod-post-text-column">
                        <span className="mod-post-link" onClick={() => history.push(`/user/${translation.updater}`)}>Updater: {functions.toProperCase(translation?.updater) || "deleted"}</span>
                        {translationDataJSX(translation)}
                    </div>
                    <div className="mod-post-options">
                        <div className="mod-post-options-container" onClick={() => rejectTranslation(translation.translationID, translation.updater, translation.postID)}>
                            <img className="mod-post-options-img" src={reject} style={{filter: getFilter()}}/>
                            <span className="mod-post-options-text">Reject</span>
                        </div>
                        <div className="mod-post-options-container" onClick={() => approveTranslation(translation.translationID, translation.updater, translation.postID)}>
                            <img className="mod-post-options-img" src={approve} style={{filter: getFilter()}}/>
                            <span className="mod-post-options-text">Approve</span>
                        </div>
                    </div>
                </div>
            )
        }
        return jsx
    }

    return (
        <div className="mod-posts">
            {generateTranslationsJSX()}
        </div>
    )
}

export default ModTranslations