---
title: OPEN-TREASURY
name: The Open Treasury
status: draft
category: Standards Track
contributors: jimstir <x.com/jimstir0>

---

## Abstract

This specification describes the components of a transparent blockchain-based treasury system.
The Open Treasury introduces a transparent treasury management mechanism,
including governance tools to encourage multi-party involvement.

## Background

The use of treasuries in blockchain products is a growing integration of many projects.
Most projects present different treasury strategies to their users,
which can open room for manipulation and exploits.
Especially for projects that do not take a security-first approach when building their projects.

The Open Treasury aims to create a universal treasury standard that users can trust and
projects can integrate with their projects quickly.
Other features include governance voting for interested parties,
transparent policies that grow an open treasury value.
The goal is to improve the trust of the treasury for all interested parties by providing a familiar standard.

## Specification

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED",  "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
[RFC 2119](http://tools.ietf.org/html/rfc2119).

Each open treasury MUST deploy the [ERC7425](https://eips.ethereum.org/EIPS/eip-7425),
a tokenized reserve contract.
The ERC7425 standard implements one [ERC20](https://eips.ethereum.org/EIPS/eip-20) token standard, the `treasuryToken`,
and one [ERC4626](https://eips.ethereum.org/EIPS/eip-4626) vault standard.
The open treasury MAY have one registered `owner`,
identified by a wallet External Owned Account(EOA) address.
The `treasuryToken` MUST have one registered `owner`,
which MUST be the Open Treasury contract address.
Before a user becomes a shareholder of a treasury,
they SHOULD verify that the open treasury `owner` is not the registered `owner` of the `treasuryToken`.
If the open treasury `owner` has control of minting the `treasuryToken`,
the shareholder could be vulnerable to treasury manipulation.
See [Token Issuance](#token-issuance) for more information on the token minting in an open treasury.
Also, the contract address of the `treasuryToken` MUST be registered on the Open Treasury smart contract.

The tokenized reserve is the core smart contract that records activity and
first approval for activity.
Depending on implementation, the tokenized reserve MAY be public or
or private to a select group of shareholders who can join.

Functions Include:

- `depositTreasury`
- 

### Token Issuance

The tokenized reserve SHOULD be the only `owner` to mint a new `treasuryToken`.
This issuance is RECOMMENDED to be a ratio of 1:1.
Participants joining an open treasury become shareholders once an approved token is deposited in the treasury.

Shareholders SHOULD NOT be able to retrieve their deposited tokens directly from the token reserve.
An open treasury is still subject to the loss of deposited tokens.
To exit an Open Treasury, shareholders SHOULD approve a policy that would detail the ratio of token swap.
Policies are explained below in the [Policy](#policy) section.

The `treasuryToken` will be used by shareholders to stake on open proposals.
A `reserveToken` is RECOMMENDED to be issued at a ratio of 1:1.
A shareholder SHOULD be able to retrieve their `treasuryToken` from the tokenized reserve,
as the staked tokens MUST NOT be accessible to the `owner` or other shareholders.
Proposals are discussed in the following section.

- deglation

### Proposals

An open proposal, `proposalOpen`,
is a request to the shareholders to transfer assets out of the treasury.

The two types of `proposalOpen` request:

1. A transactional proposal - To transfer tokens owned by the treasury to a known address.
2. A `closeRequest` proposal - To request an open proposal to be closed, if not done by the `owner`.

- Both the shareholder number of votes and the token weight are accessible.

A `proposalOpen` request MAY be opened by the treasury `owner` or a shareholder.
When open,
an invitation for shareholders to vote is created.
The number of proposals a shareholder votes in MAY be be recorded.
For more information on voting,
see the [Voting](#voting) section.

An open proposal SHOULD record the following details:

``` solidity

struct proposalOpen {
    address owner;
    IERC20 token;
    address receiver;
    uint256 amount;
}

```

Before a shareholder decides to stake a `treasuryToken`,
it is RECOMMENDED to check the details of the `receiver` address.
If this address is not a compliant policy,
the shareholder could be approving a malicious transaction.
An Open Treasury compliant policy is described in the [Policy](#policy) section below.

A `reserveToken` is issued from the ERC4626 vault contract once a `treasuryToken` deposit is made.
The `treasuryToken` is locked in the vault and is not accessible to other parties.
The total amount of `reserveToken`s issued to a shareholder during an open proposal SHOULD be recorded,
as the ERC4626 standard does not keep track of the frequency of deposits and withdrawals made.
This is considered to be the amount of votes a shareholder is casting in a proposal,
which in some cases, a record of past votes MAY be required.

Tokens staked in open proposals MUST be locked until the proposal is closed.
Each proposal should have a proposal `owner`, who is the address that opened the proposal.
When the proposal reaches approval, the owner is able to execute the transaction.

- Record executed proposals

An open proposal MAY be closed by the `owner` or by a shareholder if a `closeRequest` was approved.
The `proposalClose` event MAY be recorded,
but for most use cases this is not required.
A successful `proposalClose` event SHOULD allow the shareholder to burn the `reserveToken` in exchange for the return of their `treasuryToken`.

### Voting

All voting is conducted on the ERC7425 tokenized reserve standard.
The voting history of all open proposals SHOULD be accessible.

The current types of voting strategies supported on an Open Treasury:

- Value-Ratio Voting: When `treasuryToken`s are issued at a ratio of 1:1,
value-ratio SHOULD be calculated by the value of the number of tokens requested to transfer to the number of tokens deposited to cast a vote.
For example, if the proposal is requesting 100 tokens to be transfered,
the proposal MUST have 101 or greater `treasuryTokens` deposited.
- Supply-based Voting: When the total `treasuryToken` supply,
MUST have 75% of the `treasuryToken` supply.
It MAY be the total supply excluding any `treasuryTokens` left in open proposals.

***Note: Future voting stargites may be introduced. Current voting strategies are to promote fair token allocation to voting weight.***

Currently, an open treasury does not implement the option to vote no or
veto a proposal.
Currently, a proposal is approved based on passing the RECOMMENDED voting requirements.
Also, there are no enforced time duration requirements needed to be completed,
but implementations MAY introduce a time-based voting scheme by using the `closeRequest` on the `proposalOpen` open at a certain time.

An open proposal allows the treasury to lock `treasuryToken`s so they are not used on other open proposals.

### The Policy

A policy is a smart contract that introduces the treasury to some activity logic.
This could include token transaction flows, record management, and other mechanisms.
The policy SHOULD be approved by the shareholders before tokens are transferred to the contract.
Details of the activities/actions of the contract SHOULD be public, on/off-chain.
A compliant policy, discussed in the next section,
is an example of a policy that publicly discloses all transaction flows.

#### Compliant Policy

It is RECOMMENDED that an Open Treasury use compliant policy contract addresses,
the `receiver` value,
for `proposalOpen` requests.
A policy SHOULD have an `openProposal`, `proposalApproved`, and
`depositTreasury` functions.
A complaint policy is REQUIRED to implement the following functions:

```solidity

// The contract address of the open treasury
address public treasury;

// Create a new proposal number to request token transfer
function openProposal() public returns(uint){
    Itreasury(treasury).proposalOpen;
}

// Send approved tokens from the treasury to the policy
function getFunds() public returns(){
    Itreasury(treasury).proposalApproved;
}

// Send tokens out of the policy back to treasury
function withdraw() public {
    Itreasury(treasury).depositTreasury;
}

```

The policy SHOULD record the `proposalOpen` number, as a proposal that was opened by the policy.
It is RECOMMENDED that a policy record each proposal number that is called directly from the policy contract.
Also, the open treasury contract address.
Depending on the use case,
the policy MAY have more than one `proposalOpen` function.
A `proposalClose` function MAY be included to create a close request from the policy.
To send tokens stored on the policy to the treasury,
the policy SHOULD use the `depositTreasury` function.

## Copyright

## References

- [ERC7425](https://eips.ethereum.org/EIPS/eip-7425)
- [ERC20](https://eips.ethereum.org/EIPS/eip-20)
- [ERC4626](https://eips.ethereum.org/EIPS/eip-4626)