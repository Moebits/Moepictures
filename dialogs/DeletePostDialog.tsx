import React, {useEffect, useState, useRef} from "react"
import {useHistory} from "react-router-dom"
import {useThemeSelector, useInteractionActions, useSessionSelector, useSessionActions, usePostDialogSelector, usePostDialogActions} from "../store"
import functions from "../structures/Functions"
import Draggable from "react-draggable"
import "./styles/dialog.less"
import permissions from "../structures/Permissions"

interface Props {
    post: any
}

const DeletePostDialog: React.FunctionComponent<Props> = (props) => {
    const {i18n} = useThemeSelector()
    const {setEnableDrag} = useInteractionActions()
    const {session} = useSessionSelector()
    const {setSessionFlag} = useSessionActions()
    const {showDeletePostDialog} = usePostDialogSelector()
    const {setShowDeletePostDialog} = usePostDialogActions()
    const [reason, setReason] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState(false)
    const errorRef = useRef<any>(null)
    const history = useHistory()

    useEffect(() => {
        document.title = "Delete Post"
    }, [])

    useEffect(() => {
        if (showDeletePostDialog) {
            // document.body.style.overflowY = "hidden"
            document.body.style.pointerEvents = "none"
        } else {
            // document.body.style.overflowY = "visible"
            document.body.style.pointerEvents = "all"
            setEnableDrag(true)
        }
    }, [showDeletePostDialog])

    const deletePost = async () => {
        if (permissions.isAdmin(session)) {
            await functions.delete("/api/post/delete", {postID: props.post.postID}, session, setSessionFlag)
            history.push("/posts")
        } else {
            const badReason = functions.validateReason(reason, i18n)
            if (badReason) {
                setError(true)
                if (!errorRef.current) await functions.timeout(20)
                errorRef.current!.innerText = badReason
                await functions.timeout(2000)
                setError(false)
                return
            }
            await functions.post("/api/post/delete/request", {postID: props.post.postID, reason}, session, setSessionFlag)
            setSubmitted(true)
        }
    }

    const click = (button: "accept" | "reject", keep?: boolean) => {
        if (button === "accept") {
            deletePost()
        }
        if (!keep) setShowDeletePostDialog(false)
    }

    const close = () => {
        setShowDeletePostDialog(false)
        setSubmitted(false)
        setReason("")
    }

    if (showDeletePostDialog) {
        if (session.banned) {
            return (
                <div className="dialog">
                    <Draggable handle=".dialog-title-container">
                    <div className="dialog-box" onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                            <div className="dialog-title-container">
                                <span className="dialog-title">Delete Post Request</span>
                            </div>
                            <span className="dialog-ban-text">You are banned. Cannot submit a request.</span>
                            <button className="dialog-ban-button" onClick={() => click("reject")}>
                                <span className="dialog-ban-button-text">←Back</span>
                            </button>
                        </div>
                    </Draggable>
                </div>
            )
        }

        if (permissions.isAdmin(session)) {
            return (
                <div className="dialog">
                    <Draggable handle=".dialog-title-container">
                    <div className="dialog-box" onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                        <div className="dialog-container">
                            <div className="dialog-title-container">
                                <span className="dialog-title">Delete Post</span>
                            </div>
                            <div className="dialog-row">
                                <span className="dialog-text">Are you sure that you want to delete this post?</span>
                            </div>
                            <div className="dialog-row">
                                <button onClick={() => click("reject")} className="dialog-button">{"No"}</button>
                                <button onClick={() => click("accept")} className="dialog-button">{"Yes"}</button>
                            </div>
                        </div>
                    </div>
                    </Draggable>
                </div>
            )
        }

        return (
            <div className="dialog">
                <Draggable handle=".dialog-title-container">
                <div className="dialog-box" style={{width: "500px", height: submitted ? "125px" : "250px"}} onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                    <div className="dialog-container">
                        <div className="dialog-title-container">
                            <span className="dialog-title">Delete Post Request</span>
                        </div>
                        {submitted ? <>
                        <div className="dialog-row">
                            <span className="dialog-text">Your delete request was submitted.</span>
                        </div>
                        <div className="dialog-row">
                            <button onClick={() => close()} className="dialog-button">{"Cancel"}</button>
                            <button onClick={() => close()} className="dialog-button">{"OK"}</button>
                        </div>
                        </> : <>
                        <div className="dialog-row">
                            <span className="dialog-text-small">Why do you want to delete this post? (eg. low quality, AI-generated, or breaks other rule).</span>
                        </div>
                        <div className="dialog-row">
                            <span className="dialog-text">Reason: </span>
                            <input className="dialog-input" type="text" spellCheck={false} value={reason} onChange={(event) => setReason(event.target.value)}/>
                        </div>
                        {error ? <div className="dialog-validation-container"><span className="dialog-validation" ref={errorRef}></span></div> : null}
                        <div className="dialog-row">
                            <button onClick={() => click("reject")} className="dialog-button">{"Cancel"}</button>
                            <button onClick={() => click("accept", true)} className="dialog-button">{"Submit Request"}</button>
                        </div> </> }
                    </div>
                </div>
                </Draggable>
            </div>
        )
        
    }
    return null
}

export default DeletePostDialog