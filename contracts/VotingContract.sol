// SPDX-License-Identifier: MIT
// Solidity Smart Contract for Votelytics
// Deploy this to Ethereum (testnet or mainnet) and update the contract address in blockchain.ts

pragma solidity ^0.8.19;

contract VotingContract {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string title;
        uint256 startTime;
        uint256 endTime;
        bool active;
        uint256 candidateCount;
        mapping(uint256 => Candidate) candidates;
        mapping(address => bool) hasVoted;
        address[] voters;
    }

    address public admin;
    uint256 public electionCount;
    mapping(uint256 => Election) public elections;

    event ElectionCreated(uint256 indexed electionId, string title, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint256 indexed electionId, uint256 candidateId, string name);
    event VoterRegistered(uint256 indexed electionId, address voter);
    event VoteCast(uint256 indexed electionId, uint256 candidateId, address voter);
    event ElectionEnded(uint256 indexed electionId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier electionExists(uint256 _electionId) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice Create a new election
    /// @param _title The title of the election
    /// @param _startTime Unix timestamp for election start
    /// @param _endTime Unix timestamp for election end
    function createElection(
        string memory _title,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyAdmin {
        require(_endTime > _startTime, "End time must be after start time");
        require(_startTime >= block.timestamp, "Start time must be in the future");

        electionCount++;
        Election storage e = elections[electionCount];
        e.id = electionCount;
        e.title = _title;
        e.startTime = _startTime;
        e.endTime = _endTime;
        e.active = true;
        e.candidateCount = 0;

        emit ElectionCreated(electionCount, _title, _startTime, _endTime);
    }

    /// @notice Add a candidate to an election
    /// @param _electionId The election ID
    /// @param _name The candidate's name
    function addCandidate(
        uint256 _electionId,
        string memory _name
    ) external onlyAdmin electionExists(_electionId) {
        Election storage e = elections[_electionId];
        require(e.active, "Election is not active");
        require(block.timestamp < e.startTime, "Cannot add candidates after election starts");

        e.candidateCount++;
        e.candidates[e.candidateCount] = Candidate({
            id: e.candidateCount,
            name: _name,
            voteCount: 0
        });

        emit CandidateAdded(_electionId, e.candidateCount, _name);
    }

    /// @notice Cast a vote in an election
    /// @param _electionId The election ID
    /// @param _candidateId The candidate ID to vote for
    function castVote(
        uint256 _electionId,
        uint256 _candidateId
    ) external electionExists(_electionId) {
        Election storage e = elections[_electionId];

        require(e.active, "Election is not active");
        require(block.timestamp >= e.startTime, "Election has not started yet");
        require(block.timestamp <= e.endTime, "Election has ended");
        require(!e.hasVoted[msg.sender], "You have already voted in this election");
        require(_candidateId > 0 && _candidateId <= e.candidateCount, "Invalid candidate");

        e.hasVoted[msg.sender] = true;
        e.voters.push(msg.sender);
        e.candidates[_candidateId].voteCount++;

        emit VoteCast(_electionId, _candidateId, msg.sender);
    }

    /// @notice End an election
    /// @param _electionId The election ID
    function endElection(uint256 _electionId) external onlyAdmin electionExists(_electionId) {
        Election storage e = elections[_electionId];
        require(e.active, "Election already ended");
        e.active = false;

        emit ElectionEnded(_electionId);
    }

    /// @notice Get election results
    /// @param _electionId The election ID
    /// @param _candidateId The candidate ID
    /// @return name The candidate name
    /// @return voteCount The number of votes
    function getResults(
        uint256 _electionId,
        uint256 _candidateId
    ) external view electionExists(_electionId) returns (string memory name, uint256 voteCount) {
        Election storage e = elections[_electionId];
        require(_candidateId > 0 && _candidateId <= e.candidateCount, "Invalid candidate");

        Candidate storage c = e.candidates[_candidateId];
        return (c.name, c.voteCount);
    }

    /// @notice Check if a voter has already voted
    /// @param _electionId The election ID
    /// @param _voter The voter's address
    /// @return Whether the voter has voted
    function hasVoted(uint256 _electionId, address _voter) external view returns (bool) {
        return elections[_electionId].hasVoted[_voter];
    }

    /// @notice Get total voters in an election
    /// @param _electionId The election ID
    /// @return The number of voters
    function getVoterCount(uint256 _electionId) external view returns (uint256) {
        return elections[_electionId].voters.length;
    }

    /// @notice Get candidate count in an election
    /// @param _electionId The election ID
    /// @return The number of candidates
    function getCandidateCount(uint256 _electionId) external view returns (uint256) {
        return elections[_electionId].candidateCount;
    }
}
