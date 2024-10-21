import React, {useContext, useEffect, useState} from "react"
import {useHistory} from "react-router-dom"
import {ThemeContext, SearchContext, SearchFlagContext, SessionContext, SessionFlagContext, EmojisContext,
SiteHueContext, SiteLightnessContext, SiteSaturationContext} from "../Context"
import {HashLink as Link} from "react-router-hash-link"
import favicon from "../assets/icons/favicon.png"
import approve from "../assets/icons/approve.png"
import reject from "../assets/icons/reject.png"
import functions from "../structures/Functions"
import jsxFunctions from "../structures/JSXFunctions"
import "./styles/modposts.less"

interface Props {
    request: any
    updateReports?: () => void
}

const ReportRow: React.FunctionComponent<Props> = (props) => {
    const {siteHue, setSiteHue} = useContext(SiteHueContext)
    const {siteSaturation, setSiteSaturation} = useContext(SiteSaturationContext)
    const {siteLightness, setSiteLightness} = useContext(SiteLightnessContext)
    const {session, setSession} = useContext(SessionContext)
    const {sessionFlag, setSessionFlag} = useContext(SessionFlagContext)
    const {emojis, setEmojis} = useContext(EmojisContext)
    const [hover, setHover] = useState(false)
    const [asset, setAsset] = useState(null) as any
    const history = useHistory()

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    const updateAsset = async () => {
        if (props.request.type === "comment") {
            const asset = await functions.get("/api/comment", {commentID: props.request.id}, session, setSessionFlag)
            setAsset(asset)
        } else if (props.request.type === "thread") {
            const asset = await functions.get("/api/thread", {threadID: props.request.id}, session, setSessionFlag)
            setAsset(asset)
        } else if (props.request.type === "reply") {
            const asset = await functions.get("/api/reply", {replyID: props.request.id}, session, setSessionFlag)
            setAsset(asset)
        }
    }

    useEffect(() => {
        updateAsset()
    }, [session])

    const imgClick = (event: React.MouseEvent) => {
        if (!asset) return
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            if (props.request.type === "comment") {
                window.open(`/post/${asset.postID}`, "_blank")
            } else if (props.request.type === "thread") {
                window.open(`/thread/${asset.threadID}`, "_blank")
            } else if (props.request.type === "reply") {
                window.open(`/thread/${asset.threadID}`, "_blank")
            }
        } else {
            if (props.request.type === "comment") {
                history.push(`/post/${asset.postID}`)
            } else if (props.request.type === "thread") {
                history.push(`/thread/${asset.threadID}`)
            } else if (props.request.type === "reply") {
                history.push(`/thread/${asset.threadID}`)
            }
        }
    }

    const approveRequest = async (username: string, id: string) => {
        if (props.request.type === "comment") {
            await functions.delete("/api/comment/delete", {commentID: props.request.id}, session, setSessionFlag)
            await functions.post("/api/comment/report/fulfill", {reportID: props.request.reportID, reporter: props.request.reporter, username, id, accepted: true}, session, setSessionFlag)
        } else if (props.request.type === "thread") {
            await functions.delete("/api/thread/delete", {threadID: props.request.id}, session, setSessionFlag)
            await functions.post("/api/thread/report/fulfill", {reportID: props.request.reportID, reporter: props.request.reporter, username, id, accepted: true}, session, setSessionFlag)
        } else if (props.request.type === "reply") {
            if (!asset) return
            await functions.delete("/api/reply/delete", {threadID: asset.threadID, replyID: props.request.id}, session, setSessionFlag)
            await functions.post("/api/reply/report/fulfill", {reportID: props.request.reportID, reporter: props.request.reporter, username, id, accepted: true}, session, setSessionFlag)
        }
        props.updateReports?.()
    }

    const rejectRequest = async (username: string, id: string) => {
        if (props.request.type === "comment") {
            await functions.post("/api/comment/report/fulfill", {reportID: props.request.reportID, reporter: props.request.reporter, username, id, accepted: false}, session, setSessionFlag)
        } else if (props.request.type === "thread") {
            await functions.post("/api/thread/report/fulfill", {reportID: props.request.reportID, reporter: props.request.reporter, username, id, accepted: false}, session, setSessionFlag)
        } else if (props.request.type === "reply") {
            await functions.post("/api/reply/report/fulfill", {reportID: props.request.reportID, reporter: props.request.reporter, username, id, accepted: false}, session, setSessionFlag)
        }
        props.updateReports?.()
    }

    let img = ""
    let username = ""
    let textType = ""
    let text = [] as any
    let id = ""
    if (asset) {
        img = asset.image ? functions.getTagLink("pfp", asset.image) : favicon
        username = asset.username ? asset.username : asset.creator
        if (props.request.type === "comment") {
            textType = "Comment: "
            text = jsxFunctions.parseTextLinks(asset.comment, emojis)
            id = asset.postID
        } else if (props.request.type === "thread") {
            textType = "Thread: "
            text = jsxFunctions.parseTextLinks(asset.title, emojis)
            id = asset.threadID
        } else if (props.request.type === "reply") {
            textType = "Reply: "
            text = jsxFunctions.parseTextLinks(asset.content, emojis)
            id = asset.threadID
        }
    }

    return (
        <div className="mod-post" onMouseEnter={() =>setHover(true)} onMouseLeave={() => setHover(false)}>
            <div className="mod-post-img-container">
                <img className="mod-post-img" src={img} onClick={imgClick} onAuxClick={imgClick}/>
            </div>
            <div className="mod-post-text-column">
                <span className="mod-post-link" onClick={() => history.push(`/user/${props.request.reporter}`)}>Requester: {functions.toProperCase(props.request?.reporter) || "deleted"}</span>
                <span className="mod-post-text">Reason: {props.request.reason}</span>
                <span className="mod-post-link" onClick={() => history.push(`/user/${username}`)}>User: {username}</span>
                <span className="mod-post-text">{textType}{text}</span>
            </div>
            <div className="mod-post-options">
                <div className="mod-post-options-container" onClick={() => rejectRequest(username, id)}>
                    <img className="mod-post-options-img" src={reject} style={{filter: getFilter()}}/>
                    <span className="mod-post-options-text">Reject</span>
                </div>
                <div className="mod-post-options-container" onClick={() => approveRequest(username, id)}>
                    <img className="mod-post-options-img" src={approve} style={{filter: getFilter()}}/>
                    <span className="mod-post-options-text">Approve</span>
                </div>
            </div>
        </div>
    )
}

const ModReports: React.FunctionComponent = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const [requests, setRequests] = useState([]) as any
    const [index, setIndex] = useState(0)
    const [visibleRequests, setVisibleRequests] = useState([]) as any
    const [updateVisibleRequestFlag, setUpdateVisibleRequestFlag] = useState(false)
    const {session, setSession} = useContext(SessionContext)
    const {sessionFlag, setSessionFlag} = useContext(SessionFlagContext)
    const [offset, setOffset] = useState(0)
    const [ended, setEnded] = useState(false)

    const updateReports = async () => {
        const requests = await functions.get("/api/search/reports", null, session, setSessionFlag)
        setEnded(false)
        setRequests(requests)
    }

    useEffect(() => {
        updateReports()
    }, [session])

    const updateVisibleRequests = () => {
        const newVisibleRequests = [] as any
        for (let i = 0; i < index; i++) {
            if (!requests[i]) break
            newVisibleRequests.push(requests[i])
        }
        setVisibleRequests(functions.removeDuplicates(newVisibleRequests))
    }

    useEffect(() => {
        if (updateVisibleRequestFlag) {
            updateVisibleRequests()
            setUpdateVisibleRequestFlag(false)
        }
    }, [requests, index, updateVisibleRequestFlag])

    useEffect(() => {
        let currentIndex = index
        const newVisibleRequests = visibleRequests as any
        for (let i = 0; i < 10; i++) {
            if (!requests[currentIndex]) break
            newVisibleRequests.push(requests[currentIndex])
            currentIndex++
        }
        setIndex(currentIndex)
        setVisibleRequests(functions.removeDuplicates(newVisibleRequests))
    }, [requests])

    const updateOffset = async () => {
        if (ended) return
        const newOffset = offset + 100
        const result = await functions.get("/api/search/reports", {offset: newOffset}, session, setSessionFlag)
        if (result?.length >= 100) {
            setOffset(newOffset)
            setRequests((prev: any) => functions.removeDuplicates([...prev, ...result]))
        } else {
            if (result?.length) setRequests((prev: any) => functions.removeDuplicates([...prev, ...result]))
            setEnded(true)
        }
    }

    useEffect(() => {
        const scrollHandler = async () => {
            if (functions.scrolledToBottom()) {
                let currentIndex = index
                if (!requests[currentIndex]) return updateOffset()
                const newPosts = visibleRequests as any
                for (let i = 0; i < 10; i++) {
                    if (!requests[currentIndex]) return updateOffset()
                    newPosts.push(requests[currentIndex])
                    currentIndex++
                }
                setIndex(currentIndex)
                setVisibleRequests(functions.removeDuplicates(newPosts))
            }
        }
        window.addEventListener("scroll", scrollHandler)
        return () => {
            window.removeEventListener("scroll", scrollHandler)
        }
    })

    const generateTagsJSX = () => {
        let jsx = [] as any
        const requests = functions.removeDuplicates(visibleRequests)
        if (!requests.length) {
            return (
                <div className="mod-post" style={{justifyContent: "center", alignItems: "center", height: "75px"}} key={0}>
                    <div className="mod-post-text-column">
                        <span className="mod-post-text">No data</span>
                    </div>
                </div>
            )
        }
        for (let i = 0; i < requests.length; i++) {
            const request = requests[i] as any
            if (!request) break
            jsx.push(<ReportRow key={request.id} request={request} updateReports={() => setUpdateVisibleRequestFlag(true)}/>)
        }
        return jsx
    }

    return (
        <div className="mod-posts">
            {generateTagsJSX()}
        </div>
    )
}

export default ModReports