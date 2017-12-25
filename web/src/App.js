import React, { Component } from "react"
import logo from "./logo.svg"
import { map, addIndex, inc, assoc } from "ramda"
import "./App.css"
const Web3 = require("web3")
const fs = require("fs")
const mapIndex = addIndex(map)
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

class App extends Component {
  constructor() {
    super()
    this.state = {
      value: "",
      abi: JSON.parse(
        '[{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"totalVotesFor","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"validCandidate","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"x","type":"bytes32"}],"name":"bytes32ToString","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"candidateList","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"voteForCandidate","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"contractOwner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"inputs":[{"name":"candidateNames","type":"bytes32[]"}],"payable":false,"type":"constructor"}]'
      ),
      candidates: []
    }
  }

  componentDidMount() {
    const VotingContract = web3.eth.contract(this.state.abi)

    const candidatesList = ["Rama", "Nick", "Jose"]

    const contractInstance = VotingContract.at(
      "0x2d00caeaf8b5cc597ceb1756698e50a3abee361d"
    )
    const candidates = map(name => {
      const count = Number(contractInstance.totalVotesFor.call(name).toString())
      return {
        name,
        count
      }
    }, candidatesList)
    this.setState({ candidates })
  }

  handleChange = e => {
    this.setState({ value: e.target.value })
  }

  handleSubmit = candidateName => {
    return e => {
      const VotingContract = web3.eth.contract(this.state.abi)

      const contractInstance = VotingContract.at(
        "0x2d00caeaf8b5cc597ceb1756698e50a3abee361d"
      )

      const candidates = {
        Rama: "candidate-1",
        Nick: "candidate-2",
        Jose: "candidate-3"
      }

      contractInstance.voteForCandidate(
        candidateName,
        { from: "0x640ba007c0a70ccee1c629e1b116e923e0d35dbe" },
        () => {
          const count = Number(
            contractInstance.totalVotesFor.call(candidateName)
          )

          const updateCandidate = c =>
            c.name === candidateName ? assoc("count", count, c) : c
          const candidates = map(updateCandidate, this.state.candidates)
          this.setState({ candidates })
        }
      )
    }
  }

  render() {
    const renderCandidates = (candidate, i) => {
      return (
        <tr>
          <td>{candidate.name}</td>
          <td id={`candidate-${inc(i)}`}>{candidate.count}</td>
          <td
            onClick={this.handleSubmit(candidate.name)}
            className="btn br0 w-100 bg-blue white"
          >
            Vote
          </td>
        </tr>
      )
    }

    return (
      <div className="App">
        <h1>Voting on the Chain.</h1>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Votes</th>
              </tr>
            </thead>
            <tbody>{mapIndex(renderCandidates, this.state.candidates)}</tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default App
