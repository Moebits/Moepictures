import React, {useEffect, useContext, useState, useRef} from "react"
import {useHistory} from "react-router-dom"
import TitleBar from "../components/TitleBar"
import NavBar from "../components/NavBar"
import SideBar from "../components/SideBar"
import Footer from "../components/Footer"
import functions from "../structures/Functions"
import search from "../assets/icons/search.png"
import sort from "../assets/icons/sort.png"
import sortRev from "../assets/icons/sort-reverse.png"
import type from "../assets/icons/all.png"
import TagRow from "../components/TagRow"
import AliasTagDialog from "../dialogs/AliasTagDialog"
import EditTagDialog from "../dialogs/EditTagDialog"
import DeleteTagDialog from "../dialogs/DeleteTagDialog"
import CategorizeTagDialog from "../dialogs/CategorizeTagDialog"
import scrollIcon from "../assets/icons/scroll.png"
import pageIcon from "../assets/icons/page.png"
import permissions from "../structures/Permissions"
import PageDialog from "../dialogs/PageDialog"
import CaptchaDialog from "../dialogs/CaptchaDialog"
import {ThemeContext, EnableDragContext, HideNavbarContext, HideSidebarContext, RelativeContext, HideTitlebarContext, MobileContext, ScrollContext,
ActiveDropdownContext, HeaderTextContext, SidebarTextContext, SessionContext, SiteHueContext, SiteLightnessContext, SiteSaturationContext, TagsPageContext,
ShowPageDialogContext, PageFlagContext, SessionFlagContext, RestrictTypeContext} from "../Context"
import "./styles/itemspage.less"

let limit = 200
let replace = false

const TagsPage: React.FunctionComponent = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {siteHue, setSiteHue} = useContext(SiteHueContext)
    const {siteSaturation, setSiteSaturation} = useContext(SiteSaturationContext)
    const {siteLightness, setSiteLightness} = useContext(SiteLightnessContext)
    const {enableDrag, setEnableDrag} = useContext(EnableDragContext)
    const {hideNavbar, setHideNavbar} = useContext(HideNavbarContext)
    const {hideTitlebar, setHideTitlebar} = useContext(HideTitlebarContext)
    const {hideSidebar, setHideSidebar} = useContext(HideSidebarContext)
    const {relative, setRelative} = useContext(RelativeContext)
    const {activeDropdown, setActiveDropdown} = useContext(ActiveDropdownContext)
    const {headerText, setHeaderText} = useContext(HeaderTextContext)
    const {sidebarText, setSidebarText} = useContext(SidebarTextContext)
    const {tagsPage, setTagsPage} = useContext(TagsPageContext)
    const {showPageDialog, setShowPageDialog} = useContext(ShowPageDialogContext)
    const {pageFlag, setPageFlag} = useContext(PageFlagContext)
    const {session, setSession} = useContext(SessionContext)
    const {sessionFlag, setSessionFlag} = useContext(SessionFlagContext)
    const {restrictType, setRestrictType} = useContext(RestrictTypeContext)
    const {mobile, setMobile} = useContext(MobileContext)
    const {scroll, setScroll} = useContext(ScrollContext)
    const [sortType, setSortType] = useState("posts")
    const [sortReverse, setSortReverse] = useState(false)
    const [typeType, setTypeType] = useState("all")
    const [tags, setTags] = useState([]) as any
    const [index, setIndex] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [visibleTags, setVisibleTags] = useState([]) as any
    const [offset, setOffset] = useState(0)
    const [ended, setEnded] = useState(false)
    const [queryPage, setQueryPage] = useState(1)
    const sortRef = useRef(null) as any
    const typeRef = useRef(null) as any
    const history = useHistory()

    useEffect(() => {
        const savedScroll = localStorage.getItem("scroll")
        if (savedScroll) setScroll(savedScroll === "true")
        const savedPage = localStorage.getItem("tagsPage")
        const queryParam = new URLSearchParams(window.location.search).get("query")
        const pageParam = new URLSearchParams(window.location.search).get("page")
        const onDOMLoaded = () => {
            if (savedPage) setTagsPage(Number(savedPage))
            if (queryParam) updateTags(queryParam)
            if (pageParam) {
                setQueryPage(Number(pageParam))
                setTagsPage(Number(pageParam))
            }
        }
        const updateStateChange = () => {
            replace = true
            const pageParam = new URLSearchParams(window.location.search).get("page")
            if (pageParam) setTagsPage(Number(pageParam))
        }
        window.addEventListener("load", onDOMLoaded)
        window.addEventListener("popstate", updateStateChange)
        window.addEventListener("pushstate", updateStateChange)
        return () => {
            window.removeEventListener("load", onDOMLoaded)
            window.removeEventListener("popstate", updateStateChange)
            window.removeEventListener("pushstate", updateStateChange)
        }
    }, [])

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    const getFilterSearch = () => {
        if (theme.includes("light")) return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation - 60}%) brightness(${siteLightness + 220}%)`
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    const updateTags = async (queryOverride?: string) => {
        let query = queryOverride ? queryOverride : searchQuery
        const result = await functions.get("/api/search/tags", {sort: functions.parseSort(sortType, sortReverse), type: typeType, query, limit}, session, setSessionFlag)
        setEnded(false)
        setIndex(0)
        setVisibleTags([])
        setTags(result)
    }

    useEffect(() => {
        setHideNavbar(true)
        setHideTitlebar(true)
        setHideSidebar(false)
        setRelative(false)
        setActiveDropdown("none")
        setHeaderText("")
        setSidebarText("")
        document.title = "Tags"
        updateTags()
    }, [])

    useEffect(() => {
        if (mobile) {
            setRelative(true)
        } else {
            setRelative(false)
        }
    }, [mobile])

    useEffect(() => {
        updateTags()
    }, [sortType, sortReverse, typeType, session])

    const getPageAmount = () => {
        return scroll ? 15 : 50
    }

    useEffect(() => {
        const updateTags = () => {
            let currentIndex = index
            const newVisibleTags = visibleTags as any
            for (let i = 0; i < getPageAmount(); i++) {
                if (!tags[currentIndex]) break
                newVisibleTags.push(tags[currentIndex])
                currentIndex++
            }
            setIndex(currentIndex)
            setVisibleTags(functions.removeDuplicates(newVisibleTags))
        }
        if (scroll) updateTags()
    }, [scroll, tags])

    const updateOffset = async () => {
        if (ended) return
        let newOffset = offset + limit
        let padded = false
        if (!scroll) {
            newOffset = (tagsPage - 1) * getPageAmount()
            if (newOffset === 0) {
                if (tags[newOffset]?.fake) {
                    padded = true
                } else {
                    return
                }
            }
        }
        let result = await functions.get("/api/search/tags", {sort: functions.parseSort(sortType, sortReverse), type: typeType, query: searchQuery, limit, offset: newOffset}, session, setSessionFlag)
        let hasMore = result?.length >= limit
        const cleanTags = tags.filter((t: any) => !t.fake)
        if (!scroll) {
            if (cleanTags.length <= newOffset) {
                result = [...new Array(newOffset).fill({fake: true, tagCount: cleanTags[0]?.tagCount}), ...result]
                padded = true
            }
        }
        if (hasMore) {
            setOffset(newOffset)
            if (padded) {
                setTags(result)
            } else {
                setTags((prev: any) => functions.removeDuplicates([...prev, ...result]))
            }
        } else {
            if (result?.length) {
                if (padded) {
                    setTags(result)
                } else {
                    setTags((prev: any) => functions.removeDuplicates([...prev, ...result]))
                }
            }
            setEnded(true)
        }
    }

    useEffect(() => {
        const scrollHandler = async () => {
            if (functions.scrolledToBottom()) {
                let currentIndex = index
                if (!tags[currentIndex]) return updateOffset()
                const newVisibleTags = visibleTags as any
                for (let i = 0; i < 15; i++) {
                    if (!tags[currentIndex]) return updateOffset()
                    newVisibleTags.push(tags[currentIndex])
                    currentIndex++
                }
                setIndex(currentIndex)
                setVisibleTags(functions.removeDuplicates(newVisibleTags))
            }
        }
        if (scroll) window.addEventListener("scroll", scrollHandler)
        return () => {
            window.removeEventListener("scroll", scrollHandler)
        }
    }, [scroll, visibleTags, index, session, sortType, sortReverse, typeType])

    useEffect(() => {
        window.scrollTo(0, 0)
        if (scroll) {
            setEnded(false)
            setIndex(0)
            setVisibleTags([])
            setTagsPage(1)
            updateTags()
        }
    }, [scroll, session])

    useEffect(() => {
        if (!scroll) updateOffset()
    }, [])

    useEffect(() => {
        const updatePageOffset = () => {
            const tagOffset = (tagsPage - 1) * getPageAmount()
            if (tags[tagOffset]?.fake) {
                setEnded(false)
                return updateOffset()
            }
            const tagAmount = Number(tags[0]?.tagCount)
            let maximum = tagOffset + getPageAmount()
            if (maximum > tagAmount) maximum = tagAmount
            const maxTag = tags[maximum - 1]
            if (!maxTag) {
                setEnded(false)
                updateOffset()
            }
        }
        if (!scroll) updatePageOffset()
    }, [scroll, tags, tagsPage, ended, session, sortType, sortReverse, typeType])

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        if (searchQuery) searchParams.set("query", searchQuery)
        if (!scroll) searchParams.set("page", tagsPage)
        if (replace) {
            if (!scroll) history.replace(`${location.pathname}?${searchParams.toString()}`)
            replace = false
        } else {
            if (!scroll) history.push(`${location.pathname}?${searchParams.toString()}`)
        }
    }, [scroll, searchQuery, tagsPage])

    useEffect(() => {
        if (tags?.length) {
            const maxTagPage = maxPage()
            if (maxTagPage === 1) return
            if (queryPage > maxTagPage) {
                setQueryPage(maxTagPage)
                setTagsPage(maxTagPage)
            }
        }
    }, [tags, tagsPage, queryPage])

    useEffect(() => {
        if (pageFlag) {
            goToPage(pageFlag)
            setPageFlag(null)
        }
    }, [pageFlag])

    useEffect(() => {
        localStorage.setItem("tagsPage", String(tagsPage))
    }, [tagsPage])

    const maxPage = () => {
        if (!tags?.length) return 1
        if (Number.isNaN(Number(tags[0]?.tagCount))) return 10000
        return Math.ceil(Number(tags[0]?.tagCount) / getPageAmount())
    }

    const firstPage = () => {
        setTagsPage(1)
        window.scrollTo(0, 0)
    }

    const previousPage = () => {
        let newPage = tagsPage - 1 
        if (newPage < 1) newPage = 1 
        setTagsPage(newPage)
        window.scrollTo(0, 0)
    }

    const nextPage = () => {
        let newPage = tagsPage + 1 
        if (newPage > maxPage()) newPage = maxPage()
        setTagsPage(newPage)
        window.scrollTo(0, 0)
    }

    const lastPage = () => {
        setTagsPage(maxPage())
        window.scrollTo(0, 0)
    }

    const goToPage = (newPage: number) => {
        setTagsPage(newPage)
        window.scrollTo(0, 0)
    }

    const generatePageButtonsJSX = () => {
        const jsx = [] as any
        let buttonAmount = 7
        if (mobile) buttonAmount = 3
        if (maxPage() < buttonAmount) buttonAmount = maxPage()
        let counter = 0
        let increment = -3
        if (tagsPage > maxPage() - 3) increment = -4
        if (tagsPage > maxPage() - 2) increment = -5
        if (tagsPage > maxPage() - 1) increment = -6
        if (mobile) {
            increment = -2
            if (tagsPage > maxPage() - 2) increment = -3
            if (tagsPage > maxPage() - 1) increment = -4
        }
        while (counter < buttonAmount) {
            const pageNumber = tagsPage + increment
            if (pageNumber > maxPage()) break
            if (pageNumber >= 1) {
                jsx.push(<button key={pageNumber} className={`page-button ${increment === 0 ? "page-button-active" : ""}`} onClick={() => goToPage(pageNumber)}>{pageNumber}</button>)
                counter++
            }
            increment++
        }
        return jsx
    }

    const getSortMargin = () => {
        const rect = sortRef.current?.getBoundingClientRect()
        if (!rect) return "0px"
        const raw = window.innerWidth - rect.right
        let offset = 0
        if (sortType === "random") offset = -15
        if (sortType === "date") offset = -30
        if (sortType === "alphabetic") offset = -10
        if (sortType === "posts") offset = -30
        if (sortType === "image") offset = -25
        if (sortType === "aliases") offset = -25
        if (mobile) offset += 12
        return `${raw + offset}px`
    }

    const getTypeMargin = () => {
        const rect = typeRef.current?.getBoundingClientRect()
        if (!rect) return "0px"
        const raw = window.innerWidth - rect.right
        let offset = 0
        if (typeType === "all") offset = -35
        if (typeType === "artist") offset = -25
        if (typeType === "character") offset = -5
        if (typeType === "series") offset = -25
        if (typeType === "tag") offset = -33
        if (mobile) offset += 7
        return `${raw + offset}px`
    }

    const getSortJSX = () => {
        return (
            <div className="itemsort-item" ref={sortRef}>
                <img className="itemsort-img" src={sortReverse ? sortRev : sort} style={{filter: getFilter()}} onClick={() => setSortReverse((prev: boolean) => !prev)}/>
                <span className="itemsort-text" onClick={() => {setActiveDropdown(activeDropdown === "sort" ? "none" : "sort")}}>{functions.toProperCase(sortType)}</span>
            </div>
        )
    }

    const getTypeJSX = () => {
        return (
            <div className="itemsort-item" ref={typeRef} onClick={() => {setActiveDropdown(activeDropdown === "type" ? "none" : "type")}}>
                <img className="itemsort-img rotate" src={type} style={{filter: getFilter()}}/>
                {!mobile ? <span className="itemsort-text">{functions.toProperCase(typeType)}</span> : null}
            </div>
        )
    }

    const generateTagsJSX = () => {
        const jsx = [] as any
        let visible = [] as any
        if (scroll) {
            visible = functions.removeDuplicates(visibleTags) as any
        } else {
            const postOffset = (tagsPage - 1) * getPageAmount()
            visible = tags.slice(postOffset, postOffset + getPageAmount())
        }
        for (let i = 0; i < visible.length; i++) {
            if (visible[i].fake) continue
            if (!session.username) if (visible[i].r18) continue
            if (restrictType !== "explicit") if (visible[i].r18) continue
            jsx.push(<TagRow key={visible[i].tag} tag={visible[i]} onDelete={updateTags} onEdit={updateTags}/>)
        }
        if (!scroll) {
            jsx.push(
                <div key="page-numbers" className="page-container">
                    {tagsPage <= 1 ? null : <button className="page-button" onClick={firstPage}>{"<<"}</button>}
                    {tagsPage <= 1 ? null : <button className="page-button" onClick={previousPage}>{"<"}</button>}
                    {generatePageButtonsJSX()}
                    {tagsPage >= maxPage() ? null : <button className="page-button" onClick={nextPage}>{">"}</button>}
                    {tagsPage >= maxPage() ? null : <button className="page-button" onClick={lastPage}>{">>"}</button>}
                    {maxPage() > 1 ? <button className="page-button" onClick={() => setShowPageDialog(true)}>{"?"}</button> : null}
                </div>
            )
        }
        return jsx
    }

    const toggleScroll = () => {
        setScroll((prev: boolean) => {
            const newValue = !prev
            localStorage.setItem("scroll", `${newValue}`)
            return newValue
        })
    }

    return (
        <>
        <CaptchaDialog/>
        <AliasTagDialog/>
        <CategorizeTagDialog/>
        <EditTagDialog/>
        <DeleteTagDialog/>
        <PageDialog/>
        <TitleBar/>
        <NavBar/>
        <div className="body">
            <SideBar/>
            <div className="content" onMouseEnter={() => setEnableDrag(true)}>
                <div className="items">
                    <span className="items-heading">Tags</span>
                    <div className="items-row">
                        <div className="item-search-container" onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                            <input className="item-search" type="search" spellCheck="false" value={searchQuery} style={{width: mobile ? "170px" : "230px"}}
                            onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? updateTags() : null}/>
                            <button className="item-search-button" style={{filter: getFilterSearch()}} onClick={() => updateTags()}>
                                <img src={search}/>
                            </button>
                        </div>
                        {getSortJSX()}
                        {!mobile ? <div className="itemsort-item" onClick={() => toggleScroll()}>
                            <img className="itemsort-img" src={scroll ? scrollIcon : pageIcon} style={{filter: getFilter()}}/>
                            <span className="itemsort-text">{scroll ? "Scrolling" : "Pages"}</span>
                        </div> : null}
                        <div className={`item-dropdown ${activeDropdown === "sort" ? "" : "hide-item-dropdown"}`} 
                        style={{marginRight: getSortMargin(), top: mobile ? "229px" : "209px"}} onClick={() => setActiveDropdown("none")}>
                            <div className="item-dropdown-row" onClick={() => setSortType("random")}>
                                <span className="item-dropdown-text">Random</span>
                            </div>
                            <div className="item-dropdown-row" onClick={() => setSortType("date")}>
                                <span className="item-dropdown-text">Date</span>
                            </div>
                            <div className="item-dropdown-row" onClick={() => setSortType("alphabetic")}>
                                <span className="item-dropdown-text">Alphabetic</span>
                            </div>
                            <div className="item-dropdown-row" onClick={() => setSortType("posts")}>
                                <span className="item-dropdown-text">Posts</span>
                            </div>
                            <div className="item-dropdown-row" onClick={() => setSortType("image")}>
                                <span className="item-dropdown-text">Image</span>
                            </div>
                            <div className="item-dropdown-row" onClick={() => setSortType("aliases")}>
                                <span className="item-dropdown-text">Aliases</span>
                            </div>
                            <div className="item-dropdown-row" onClick={() => setSortType("length")}>
                                <span className="item-dropdown-text">Length</span>
                            </div>
                        </div>
                        {getTypeJSX()}
                        <div className={`item-dropdown ${activeDropdown === "type" ? "" : "hide-item-dropdown"}`} 
                        style={{marginRight: getTypeMargin(), top: mobile ? "229px" : "209px"}} onClick={() => setActiveDropdown("none")}>
                            <div className="item-dropdown-row" onClick={() => setTypeType("all")}>
                                <span className="item-dropdown-text">All</span>
                            </div>
                            <div className="item-dropdown-row" onClick={() => setTypeType("artist")}>
                                <span className="item-dropdown-text">Artist</span>
                            </div>
                            <div className="item-dropdown-row" onClick={() => setTypeType("character")}>
                                <span className="item-dropdown-text">Character</span>
                            </div>
                            <div className="item-dropdown-row" onClick={() => setTypeType("series")}>
                                <span className="item-dropdown-text">Series</span>
                            </div>
                            <div className="item-dropdown-row" onClick={() => setTypeType("meta")}>
                                <span className="item-dropdown-text">Meta</span>
                            </div>
                            <div className="item-dropdown-row" onClick={() => setTypeType("tag")}>
                                <span className="item-dropdown-text">Tag</span>
                            </div>
                        </div>
                    </div>
                    <table className="items-container" style={{marginTop: "15px"}}>
                        {generateTagsJSX()}
                    </table>
                </div>
                <Footer/>
            </div>
        </div>
        </>
    )
}

export default TagsPage