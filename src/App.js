import React from 'react';
import './App-1.css';
import { BrowserRouter, Route, Switch, useHistory, Redirect } from "react-router-dom";

import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Main from "./pages/Main";
import Mypage from "./pages/Mypage"
import FollowList from "./pages/FollowList"
import axios from "axios"
import { render } from 'react-dom';

axios.defaults.withCredentials = true;

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      isSignin: false,
      userinfo: {},
      followinfo: [],
    };
    this.handleSignout = this.handleSignout.bind(this);
    this.passwordValidationCheck = this.passwordValidationCheck.bind(this)
    this.getFriendsList = this.getFriendsList.bind(this)
    this.addNewFriend = this.addNewFriend.bind(this)
  }
  getFriendsList() {
    axios.get("http://localhost:5000/followlist")
      .then(res => {
        let followlist = res.data
        this.setState({ followinfo: followlist })
      })
      .catch(e => console.log(e))
  }

  handleSignout() {
    this.setState({ isSignin: false, userinfo: {}, todos: [] });
    axios
      .post("http://localhost:5000/signout")
      .catch(e => console.log(e))
  }

  addNewFriend = (user) => {
    let temp = this.state.followinfo
    temp.push(user)
    this.setState({
      followinfo: temp
    })
  }

  passwordValidationCheck = (pw) => { // signup과 mypage에서 공통적으로 사용되는 method이기 때문에, app에서 props로 내려주도록 했습니다.
    let num = pw.search(/[0-9]/g);  // 주어진 pw에 0~9사이에 숫자가 있으면 0, 없으면 -1
    let eng = pw.search(/[a-z]/ig); // 주어진 pw에 a~z사이에 문자가 있으면 0, 없으면 -1
    let spe = pw.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi); // 주어진 pw에 대괄호 안의 특수문자가 있으면 0, 없으면 -1

    if (pw.length < 8 || pw.length > 20) {
      alert("비밀번호는 8~20자 이내입니다.")
      return false;
    } else if (pw.search(/\s/) !== -1) {
      alert("비밀번호에는 공백을 포함할 수 없습니다.")
      return false;
    } else if (num < 0 || eng < 0 || spe < 0) {
      alert("비밀번호에는 숫자, 영문, 특수문자가 포함되어야 합니다")
      return false;
    } else {
      return true
    }
  }

  render() {
    const { isSignin, userinfo, todos, followinfo } = this.state;
    console.log(isSignin, userinfo);
    return (
      <div>
        <BrowserRouter>
          <Switch>
            <Route
              path="/signin"
              render={() => (
                <Signin
                  isSignin={isSignin}
                  handleisSigninChange={this.handleisSigninChange}
                  history={useHistory}
                />
              )}
            />
            <Route
              exact
              path="/signup"
              render={() => <Signup isSignin={isSignin} pwCheck={this.passwordValidationCheck} />}
            />
            <Route
              exact
              path="/mypage"
              render={() => <Mypage isSignin={isSignin} handleSignout={this.handleSignout} userinfo={userinfo} history={useHistory} pwCheck={this.passwordValidationCheck} />}
            />
            <Route
              exact
              path="/main"
              render={() => <Main isSignin={isSignin} userinfo={userinfo} handleSignout={this.handleSignout} todos={todos} />}
            />
            <Route
              exact
              path="/followlist"
              render={() => <FollowList userinfo={userinfo} isSignin={isSignin} addNewFriend={this.addNewFriend} handleSignout={this.handleSignout} history={useHistory} />}
            />
            <Route
              path="/"
              render={() => {
                if (isSignin) {
                  return <Redirect to="/main" />;
                }
                return <Redirect to="/signin" />;
              }}
            />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}
export default App;
