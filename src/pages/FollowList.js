import React from 'react';
import { withRouter, Link, useHistory } from 'react-router-dom';
import axios from 'axios'
import { render } from 'react-dom';
import FollowEntry from './FollowEntry'
import { Motion, spring } from "react-motion"

class FollowList extends React.Component {
    constructor(props) {
        super();
        this.state = {
            emailToAdd: null,
            isAddOpen: false,
            followlist: []
        }
        this.handleNewFollowList = this.handleNewFollowList.bind(this)
        this.handleInputValue = this.handleInputValue.bind(this)
        this.handleAddFriend = this.handleAddFriend.bind(this)
        this.handleAddFriendOpen = this.handleAddFriendOpen.bind(this)
    }

    componentDidMount() {
        axios.get(`http://localhost:5000/followlist`)
            .then(res => {
                console.log(res)
                this.setState({ followlist: res.data.friend })
            })
    }

    handleNewFollowList = (list) => {
        this.setState({ followlist: list })
    }

    handleInputValue = (key) => (e) => {
        this.setState({ [key]: e.target.value });
    };

    handleAddFriend = () => {
        return axios.post(`http://localhost:5000/followAdd`, { friendemail: this.state.emailToAdd })
            .then(res => {
                console.log(res)
                axios.get('http://localhost:5000/followlist')
                    .then(res => this.handleNewFollowList(res.data.friend))
            })
    }


    handleAddFriendOpen = () => {
        this.setState({ isAddOpen: !this.state.isAddOpen })
    }

    render() {
        // let { followinfo } = this.props
        let { isAddOpen, followlist } = this.state
        return (
            <>
                <div className="modal-mask" style={{ display: isAddOpen ? 'block' : 'none' }}>
                    <div className="modal-window">
                        <form className="Form addFriend" onSubmit={(e) => { e.preventDefault(); this.handleAddFriend(); }}>
                            <div className="headerText">친구추가</div>
                            <input placeholder="친구 이메일 입력" onChange={this.handleInputValue("emailToAdd")}></input>
                            <button style={{ marginTop: "80px" }} onClick={this.handleAddFriend}>추가하기</button>
                            <button onClick={this.handleAddFriendOpen}>취소</button>
                        </form>
                    </div>
                </div>
                <div className="pagebox">
                    <div className="nav">
                        <button id='edit-logout' onClick={() => { this.props.handleSignout(); this.props.history.push('/') }}>로그아웃</button>
                        <button id='gotomypage' onClick={() => { this.props.history.push('/mypage') }}>Mypage</button>
                        <button id='gotomain' onClick={() => { this.props.history.push('/main') }}>Todo List</button>
                        <button id='addfollow' onClick={this.handleAddFriendOpen} >친구추가</button>
                    </div>

                    <ul>
                        <div className="headerText" style={{ marginTop: "70px" }}> 친구목록
                            {followlist.length ?
                                followlist.map(follower => <FollowEntry follower={follower} handleNewFollowList={this.handleNewFollowList} />)
                                : <div id="noFriends">음..... 친구가 없을수도 있다고 생각해요. <br></br>괜찮아요, 저도 많이 없거든요</div>}
                        </div>
                    </ul>
                </div>


            </>
        )
    }
}

export default withRouter(FollowList)