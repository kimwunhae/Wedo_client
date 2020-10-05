import React from 'react';
import { withRouter, Link, useHistory } from 'react-router-dom';
import axios from 'axios'
import { render } from 'react-dom';
import TodoEntry from "./TodoEntry"
import { Motion, spring } from "react-motion"
import { Circle, Line } from "rc-progress"

class Main extends React.Component {
    constructor() {
        super()
        this.state = {
            userinfo: {},
            todos: [],
            isAddOpen: false,
            isDeleted: false,
            title: "",
            body: "",
            followinfo: [],
            currentTime: { hour: null, minutes: null },
            current: null,
            currentWeatherIcon: null,
            currentTemp: null,
            isShareOpen: false,
            searchFriend: [],
            shareTo: [],
        }
        this.handleInputValue = this.handleInputValue.bind(this)
        this.handleAdd = this.handleAdd.bind(this)
        this.handleAddOpen = this.handleAddOpen.bind(this)
        this.resetForm = this.resetForm.bind(this)
        this.getTime = this.getTime.bind(this)
        this.getWeather = this.getWeather.bind(this)
        this.handleIsShareOpen = this.handleIsShareOpen.bind(this)
        this.handleEditedData = this.handleEditedData.bind(this)
        this.handleFetchTodo = this.handleFetchTodo.bind(this)
        this.handleAddShareTo = this.handleAddShareTo.bind(this)
        this.handleRemoveShareTo = this.handleRemoveShareTo.bind(this)
    }
    componentDidMount() {
        this.getWeather()
        setInterval(this.getTime, 1000)

        axios.all([axios.get(`http://localhost:5000/main`), axios.get(`http://localhost:5000/followlist`), axios.get(`http://localhost:5000/userinfo`)])
            .then(axios.spread((todos, followlist, userinfo) => {
                console.log(todos.data)
                this.setState({
                    todos: todos.data, followinfo: followlist.data.friend, userinfo: userinfo.data
                })
            })
            )
    }
    getTime() {
        let day = new Date()
        let time = {}
        let hours = day.getHours()
        let str = day.toLocaleTimeString().split(':')
        if (hours >= 5) {
            this.setState({ current: "morning" })
        } else if (hours >= 11 && hours <= 17) {
            this.setState({ current: "afternoon" })
        } else {
            this.setState({ current: "evening" })
        }
        time.hour = str[0]
        time.minutes = str[1]
        this.setState({ currentTime: time })
    }
    handleIsShareOpen = () => {
        this.setState({ isShareOpen: !this.state.isShareOpen, shareTo: [] })
        document.getElementById('resetTarget').value = ""
    }
    handleInputValue = (key) => (e) => {
        this.setState({ [key]: e.target.value });
    };
    handlePublicOnly = () => {
        this.setState({ publicOnly: !this.state.publicOnly })
    };
    handleFetchTodo(data) {
        this.setState({ todos: data })
    }
    handleAddShareTo = (e) => {
        let { friendToSearch, shareTo, followinfo } = this.state
        let temp = shareTo
        let isFound = false;

        for (let follower of shareTo) {
            if (follower[1] === friendToSearch) {
                return alert("이미 목록에 있는 친구입니다")
            }
        }

        for (let friend of followinfo) {
            if (friend.full_name === friendToSearch) {
                temp.push([friend.id, friend.full_name])
                isFound = true
            }
        }

        if (isFound) {
            return;
        } else {
            return alert("친구 이름을 다시 확인해주세요.")
        }
    }

    handleRemoveShareTo = (e) => { // 공유할 친구 리스트에서 친구를 제거합니다.
        let userid = e.target.getAttribute('userid')
        let temp = this.state.shareTo
        console.log('this is target id', userid)
        console.log('this is target temp', temp)
        for (let i = 0; i < temp.length; i++) {
            if (temp[i][0] === userid) {
                let front = temp.slice(0, i)
                console.log('this is front', front)
                let tail = temp.slice(i + 1, temp.length)
                console.log('this is tail', tail)
                temp = front.concat(tail)
                console.log('this is after temp', temp)
            }
        }
        this.setState({ shareTo: temp })
    }
    handleEditedData(record) {
        let temp = this.state.todos
        console.log(record)
        for (let i = 0; i < temp.length; i++) {
            if (record.id === temp[i].id) {
                temp[i] = record
            }
        }
        console.log(temp)
        this.setState({ todos: temp })
    }
    // render에 직접 적용된 함수를 메소드로 정리했습니다.
    handleAdd = () => {
        const { title, body, shareTo } = this.state
        if (title && body) {
            axios.post("http://localhost:5000/todowrite", { title, body })
                .then(res => {
                    if (shareTo.length > 0) {
                        for (let user of shareTo) {
                            axios.post("http://localhost:5000/sharetodo", { todoid: res.data.id, friendid: Number(user[0]) })
                                .then(res => {
                                    axios.get(`http://localhost:5000/main`)
                                        .then(newlist => this.setState({ todos: newlist.data }))
                                }).catch(err => { alert("에러가 발생했습니다. 다시 시도해주세요."); console.log(err) })
                        }
                    } else {
                        axios.get(`http://localhost:5000/main`)
                            .then(newlist => this.setState({ todos: newlist.data }))
                    }
                })
                .then(() => this.handleAddOpen())
                .catch(err => { alert("에러가 발생했습니다. 다시 시도해주세요."); console.log(err) });
        }
        else {
            alert("내용을 입력해주세요.")
        }
    }
    handleAddOpen = () => {
        this.setState({ isAddOpen: !this.state.isAddOpen })
    }

    getProgress = () => {
        let alltodos = this.state.todos.length
        let counter = 0;

        for (let todo of this.state.todos) {
            if (todo.isclear) {
                counter = counter + 1
            }
        }
        return { todos: alltodos, clear: counter, progress: (counter / alltodos * 100) }
    }

    resetForm() {
        document.querySelector("#titleInput").value = null
        document.querySelector("#bodyInput").value = null
        this.setState({ title: null, body: null }) // Form reset시 state도 비워주는 구문을 추가했습니다.
    }
    getWeather() { // 일단 서울 날씨를 Signin 페이지에 표기합니다.
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Seoul&units=metric&lang=kr&appid=${process.env.REACT_APP_WEATHER_API_KEY}`, { // REACT에서 활용할 환경변수는 앞에 REACT_APP_ 이 붙어있어야 한다.
            withCredentials: false
        })
            .then(data => {
                let { temp } = data.data.main;
                let { icon } = data.data.weather[0]
                console.log(data.data)
                this.setState({ currentTemp: temp.toFixed(1), currentWeatherIcon: icon })
            })
    }
    render() {
        let { todos, isAddOpen, currentWeatherIcon, currentTemp,
            isShareOpen, shareTo, publicOnly, followinfo, userinfo } = this.state

        return (
            <div>
                <div className="pagebox">
                    <div className="nav">
                        <button id='edit-logout' onClick={() => { this.props.handleSignout(); this.props.history.push('/') }}>로그아웃</button>
                        <button id='gotomypage' onClick={() => { this.props.history.push('/mypage') }}>Mypage</button>
                        <button id='followlist' onClick={() => { this.props.history.push('/followlist') }}>친구목록</button>
                        <div className={this.state.current === "day" ? "Text weatherInfo-day" : "Text weatherInfo-night"} >
                            <img src={`http://openweathermap.org/img/wn/${currentWeatherIcon}@2x.png`} className="weatherImage" />
                            <div className="currentTemp">
                                서울<br></br><b style={{ fontWeight: "bolder" }}>{currentTemp} 도</b>
                            </div>
                        </div>
                        <div className="currentTime-main" >
                            현재 시각 <b>{this.state.currentTime.hour}시 {this.state.currentTime.minutes}분</b>
                        </div>
                    </div>

                    <Motion defaultStyle={{ opacity: 0 }}
                        style={{ opacity: spring(1) }}>
                        {(style) => (<div style={{ transform: `translateX(${style.x}px)`, opacity: style.opacity }} className="Text Sayhi" >
                            <div>
                                {this.state.current === "" ? <div /> : this.state.current = "morning" ? <div> 안녕하세요! <br></br> 좋은 아침이에요.</div>
                                    : this.state.current === "afternoon" ? <div> 피곤하시죠? <br></br>
                                        <a href="https://www.google.com/search?source=hp&ei=AL5yX4fHF4i2mAWf75vACA&q=%EC%8A%A4%ED%83%80%EB%B2%85%EC%8A%A4&oq=%EC%8A%A4%ED%83%80%EB%B2%85%EC%8A%A4&gs_lcp=CgZwc3ktYWIQAzIFCAAQsQMyBQgAELEDMgUIABCxAzICCAAyBQgAELEDMgIIADICCAAyAggAMgIIADICCAA6CAgAELEDEIMBOgQIABAKUPACWO8VYJ8XaAhwAHgDgAFviAHoCZIBBDAuMTKYAQCgAQGqAQdnd3Mtd2l6sAEA&sclient=psy-ab&ved=0ahUKEwiHx8WdyY3sAhUIG6YKHZ_3BogQ4dUDCAc&uact=5">
                                            커피 한 잔 어때요?</a></div>
                                        : <div>오늘도 고생하셨어요.<br></br> 좋은 밤 되세요.</div>}
                            </div>
                        </div>)}
                    </Motion>
                    <div id="progressBlock">
                        <Line style={{ width: "500px", marginRight: "30px" }} percent={this.getProgress().progress} strokeWidth="2" strokeColor='#A770EF' />
                        <div id="progressText"> <b>{this.getProgress().todos}개</b> 중 <b>{this.getProgress().clear}개</b> 완료했습니다.</div>
                    </div>
                    <div className="textbox">
                        <div className="todoListTitle">
                            TODO LIST
                        </div>
                        <div className="addButtons-main">
                            <button className="addButton" onClick={this.handleAddOpen} style={{ display: isAddOpen ? "none" : "block" }}>추가하기</button>
                            <button className="addButton" onClick={this.handlePublicOnly} style={{ display: isAddOpen ? "none" : "block" }}>{publicOnly ? "모든 Todo" : "공유중인 Todo"}</button>
                        </div> {/*  Add가 열리면 Add 버튼을 숨깁니다. */} {/* TodoEntry가 렌더되는 부분입니다*/}
                        <div className="add-todo" style={{ display: isAddOpen ? "block" : "none" }}> {/*  isAddOpened를 확인하여 렌더합니다. */}
                            <form className={isShareOpen ? "addForm toLeft" : "addForm"} onSubmit={(e) => { e.preventDefault(); this.handleAdd(); this.resetForm(); }} >
                                <div><input type="title" id="titleInput" placeholder="제목" onChange={this.handleInputValue("title")} /></div>
                                <div><textarea type="body" id="bodyInput" placeholder="내용" onChange={this.handleInputValue("body")} /></div>
                                <div style={{ overflow: "hidden", width: isShareOpen ? "750px" : "500px", paddingLeft: isShareOpen ? "-200px" : "0px", marginTop: "0px" }} className="editFormButtons">
                                    <button className="cancelButton-main" type="reset" onClick={this.handleAddOpen}></button>
                                    <button id="editOkay-main" type="submit"></button>
                                    <button id={isShareOpen ? "shareButton-main-Active" : "shareButton-main"} type="button" onClick={this.handleIsShareOpen}></button> {/* todo Add와 동시에 Share 할 수 있는 기능 구현*/}
                                </div>
                            </form>
                            <div className="addForm" id="shareForm-main" style={{ display: isShareOpen ? "" : "none" }}>
                                <input className="searchInput" id="resetTarget" placeholder="친구이름입력" onChange={this.handleInputValue("friendToSearch")}></input>  {/*친구 이름 검색창*/}
                                <button id="addShareFriendButton" onClick={this.handleAddShareTo} />
                                <div id="shareTo">
                                    {shareTo.map(friend =>
                                        <div key={friend[0]}>
                                            <div className="searchFriendEntry" >
                                                {friend[1]}
                                            </div>
                                        </div>)}
                                </div>
                            </div>
                        </div>
                        <Motion defaultStyle={{ x: -200, opacity: 0 }} style={{ x: spring(0), opacity: spring(1) }} >
                            {(style) => (
                                <div style={{ transform: `translateX(${style.x}px)`, opacity: style.opacity }}>
                                    {todos.map(todo =>
                                        <TodoEntry
                                            publicOnly={publicOnly}
                                            userinfo={userinfo}
                                            key={todo.id}
                                            todo={todo}
                                            followinfo={followinfo}
                                            handleInputValue={this.handleInputValue}
                                            handleFetchTodo={this.handleFetchTodo}
                                            handleEditedData={this.handleEditedData} />)}</div>)}
                        </Motion>
                    </div>
                </div>
            </div >
        )
    }
}
export default withRouter(Main)