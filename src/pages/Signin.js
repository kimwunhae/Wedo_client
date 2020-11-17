import React from 'react';
import axios from 'axios';
import { Route, Redirect } from "react-router-dom";

axios.defaults.withCredentials = true;

export default class Signin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: null,
            password: null,
            hasAccount: true,
            currentWeatherIcon: null,
            currentTemp: null,
            currentTime: {
                hour: null,
                minutes: null
            },
            current: null,
        }
        this.hasAccountHandler = this.hasAccountHandler.bind(this)
        this.valueChange = this.valueChange.bind(this)
        this.getWeather = this.getWeather.bind(this)
        this.getTime = this.getTime.bind(this)
    }

    componentDidMount = () => {
        this.getWeather();
        setInterval(this.getTime, 1000)
    }

    valueChange = (stateName) => (e) => { // emailChange와 passwordChange를 valueChange로 통합했습니다.
        this.setState({
            [stateName]: e.target.value
        })
    }

    hasAccountHandler = () => {
        this.setState({
            hasAccount: false
        })
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
    getTime() {
        let day = new Date()
        let time = {}
        let str = day.toLocaleTimeString().split(':')
        time.hour = str[0]
        time.minutes = str[1]
        let hours = day.getHours()
        if (hours >= 8 && hours <= 19) {
            this.setState({ current: "day" })
        }
        else {
            this.setState({ current: "night" })
        }
        this.setState({ currentTime: time })
    }
    render() {
        let { currentTemp, currentWeatherIcon } = this.state

        if (this.props.isSignin) {
            return <Redirect to="/" />
        } else if (!(this.state.hasAccount)) {
            return <Redirect to={`/signup`} />
        }
        else {
            return (
                <div className="pagebox">
                    <div className="weather">
                        <div className="currentTime">
                            현재 시각은
                        <p>
                                <b>{this.state.currentTime.hour}시 {this.state.currentTime.minutes}분</b>
                            </p>
                        </div>

                        <div className={this.state.current === "day" ? "Text weatherInfo-day" : "Text weatherInfo-night"} >
                            <img src={`http://openweathermap.org/img/wn/${currentWeatherIcon}@2x.png`} className="weatherImage" />
                            <div className="currentTemp">
                                서울<br></br><b style={{ fontWeight: "bolder" }}>{currentTemp} 도</b>
                            </div>
                        </div>
                    </div>
                    <div id="logo"></div>
                    <form className="Form Signin" method="POST" action="http://localhost:5000/signin" > {/*HTML5 유효성검사를 사용하기 위해 form형식을 사용했으나, 실제로 데이터 전송은 axios를 사용했습니다.*/}
                        <label>
                            <div className="signInput">
                                <input onChange={this.valueChange("email")} name="email" type="email" placeholder="이메일을 입력해주세요" />
                            </div>
                        </label> {/* HTML5 내장 이메일 유효성 검사를 진행하도록 수정했습니다 9/24 */}
                        <label>
                            <div className="signInput">
                                <input onChange={this.valueChange("password")} name="password" type="password" placeholder="비밀번호를 입력해주세요" />
                            </div>
                        </label>
                        <div className="signupButtons">
                            <button id="Login" type="submit">로그인</button>
                            <button id="OauthGoogle" type="button" onClick={() => { window.location.replace('http://localhost:5000/auth/google') }}>Sign in with Google</button>
                        </div>
                        <div id="GoToSignup" onClick={this.hasAccountHandler}>Create a new account</div> {/* /signup 으로 이동하는 Redirect를 구현했습니다*/}
                    </form>
                </div>
            )
        }
    }
}
