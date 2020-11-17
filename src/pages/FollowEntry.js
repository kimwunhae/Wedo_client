import React from 'react';
import { withRouter, Link, useHistory } from 'react-router-dom';
import axios from 'axios'
import { render } from 'react-dom';
import { Motion, spring } from "react-motion"

export default class FollowEntry extends React.Component {
    constructor(props) {
        super();
        this.handleUnfollow = this.handleUnfollow.bind(this)
    }

    handleUnfollow = () => {
        axios.post(`http://localhost:5000/followdelete`, { friendid: this.props.follower.id })
            .then(res => {
                let newList = res.data.friend
                this.props.handleNewFollowList(newList)
            })
    }
    render() {
        return (
            <li className="follower" >
                <div className="followerbox">
                    <div className="entry name">{this.props.follower.nickname}</div>
                    <div className="entry email">{this.props.follower.email}</div>
                    <button className="entry button" onClick={this.handleUnfollow}></button>
                </div>
            </li>)
    }
}