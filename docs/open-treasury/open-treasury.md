---
title: OPEN-TREASURY
name: The Open Treasury
status: draft
category: Standards Track
contributors: jimstir

---

## Abstract

This specification describes the components of a transparent blockchain-based treasury system.
The Open Treasury introduces a transparent treasury management mechanism,
including governance tools to encourage multi-party involvement.

## Background

The use of treasuries in blockchain products is a growing requirement for many projects.
Most projects present different treasury strategies to their users,
which can open room for manipulation and exploits.
This is especially true for projects that do not take a security-first approach when building their projects.

The Open Treasury aims to create a universal on-chain multi-party treasury protocol that users can trust and
projects can integrate into their projects quickly.
Governance voting is a main feature of the protocol as treasuries tend to have multiple interested parties.
Transparent policies are shared with all parties,
which encourages treasury owners to conduct themselves properly.
The goal is to improve the trust of the treasury for all interested parties by displaying every activity.
This document details the components of public treasuries;
private treasuries can be easily supported.

## Specification

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
[RFC 2119](http://tools.ietf.org/html/rfc2119).

Each open treasury MUST deploy the [ERC7425](https://eips.ethereum.org/EIPS/eip-7425),
a tokenized reserve contract.
The ERC7425 standard implements one [ERC20](https://eips.ethereum.org/EIPS/eip-20) token standard, the `treasuryToken`,
and one [ERC4626](https://eips.ethereum.org/EIPS/eip-4626) vault standard.
The open treasury MAY have one registered `owner`,
identified by a wallet External Owned Account(EOA) address.
The registered `owner` MAY assign other authorized addresses for the open treasury.
All authorized addresses SHOULD be publicly viewable.
If the open treasury contract has optional authorized addresses,
the shareholder needs to verify each address and their functions if an address is a contract.
In other words, it is the responsibility of the `owner` to identify each authorized address and
the responsibility of the shareholder to verify the functions of those addresses before participating.

The `treasuryToken` registered `owner` MUST be the open treasury contract.
Before a user becomes a shareholder of a treasury,
they SHOULD verify that the open treasury `owner` is not the registered `owner` of the `treasuryToken`.
If the open treasury `owner` has control of minting functions on the `treasuryToken` contract,
the shareholder could be exposed to treasury manipulation.
See [Token Issuance](#token-issuance) for more information on the token minting.

The tokenized reserve is the core smart contract that records activity and
voting approvals for treasury activity.
Based on the implementation, the tokenized reserve MAY be public to all participants or
private to a select group of shareholders.

### Token Issuance

The tokenized reserve SHOULD be the only `owner` to mint a new `treasuryToken`.
Participants joining an open treasury become shareholders once an approved token is deposited in the treasury.
It is RECOMMENDED that shareholders are not capable of retrieving their deposited tokens directly from the tokenized reserve.
The open treasury is still subject to the loss of deposited tokens.
To exit an Open Treasury, shareholders MAY approve a policy that would detail the ratio of token swap based on the performance of that treasury.
More details about treasury exit are detailed in the [Exit Treasury](#enter-or-exit-the-treasury) section.
More details about policies are explained below in the [Policy](#policy) section.

The `treasuryToken` will be used by shareholders to stake on open proposals.
A `reserveToken` is MUST be issued at a ratio of 1:1.
The `treasuryToken` MUST be able to be retrieved directly from the tokenized reserve,
The `owner` MUST NOT be able to access staked `treasuryToken`s held on the treasury contract,
unless the owner is a shareholder themselves.
Proposals are discussed in the following section.

### Proposals

An open proposal, `proposalOpen`, is a request, by the owner or authorized user,
to the shareholders to execute some action related to the treasury.
The RECOMMENDED two types of `proposalOpen` request:

1. A transactional proposal - To transfer tokens owned by the treasury to a known address.
2. A `closeRequest` proposal - To request an open proposal to be closed, if not done by the `owner`.

Both the shareholder number of votes and the token weight SHOULD be accessible through the treasury.
It is the responsibility of shareholders to verify all proposal types before participating.

A `proposalOpen` request MAY be opened by the treasury `owner` or a shareholder.
When a proposal is open,
shareholders can stake a `treasuryToken` which will count as one vote for the proposal.
The number of proposals a shareholder votes in SHOULD be recorded.
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
For example, if the proposal is requesting 100 tokens to be transferred,
the proposal MUST have 101 or greater `treasuryTokens` deposited.
- Supply-based Voting: When the total `treasuryToken` supply,
MUST have 75% of the `treasuryToken` supply.
It MAY be the total supply excluding any `treasuryTokens` left in open proposals.

***Note: Future voting strategies may be introduced. Current voting strategies are to promote fair token allocation to voting weight.***

Currently, an open treasury does not implement the option to vote no or
veto a proposal.
Currently, a proposal is approved based on passing the RECOMMENDED voting requirements.
Also, there are no enforced time duration requirements that need to be completed,
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

### Enter or Exit the Treasury

There MAY be an exit strategy to protect a deployed Open Treasury from sudden liquidity crises, which include
bank runs on the deposited token held by the treasury
and to ensure that profits are fairly distributed to active participants.
It is the user's responsibility to verify the exit strategy before joining a treasury.
A treasury may not keep token issuance at a 1:1 ratio, as this could cause shareholder loss of funds in certain types of treasuries.
If a treasury has an `Open Join` design,
the user can assume that the ratio will remain at 1:1 and
the exit strategy may be done directly from the open treasury smart contract.
This is the base case, type `1A`, for an Open Treasury,
but this approach limits the use cases of the treasury activities.
Below are the RECOMMENDED join and exit strategies,
with each join paired with RECOMMENDED exits:

1. Join Mechanics

How external tokens enter the treasury and
are converted into `treasuryToken` shares.

Type `1A`: Open Join

**Mechanism**: Users MUST be able to deposit the approvedToken token at any time.
Shares are minted immediately based on the real-time `totalAssets()` calculation.
**Behavior**: Highly susceptible to MEV front-running and
Oracle lag if the vault actively trades volatile assets.
**Exit Pairs**: `2A` 

Type `1B`: Epoch (Funding Queues)

**Mechanism**: Deposits are held in an isolated "Pending Queue" and
do not immediately interact with the active treasury.
Shares are minted when a round finalization event is triggered.
**Behavior**: New shareholders MAY be discouraged from joining a treasury for short-term gain.
**Exit Pairs**: `2A`,`2B`, `2C`, `2D`

2. Exit Mechanics

How `treasuryToken` shareholders can exit an open treasury.

Type `2A`: Immutable (Restricted / Secondary Only)

**Mechanism**: There is no defined exit function implemented.
**Behavior**: The approved deposited token MUST never be individually reclaimed.
Shareholders must rely entirely on external secondary markets (e.g., Uniswap) to exit.

Type `2B`: Consensus (Proposal-Gated)

**Mechanism**: Withdrawals are locked by default.
The approved deposited token controlled by the treasury becomes exit liquidity only when an exit proposal is approved.
**Behavior**: Upon approval, active policies SHOULD be closed and liquidated.
Once policies are closed,
a time-bound window SHOULD be opened for shareholders to exit.
This proposal MAY use the base [ERC4626](https://eips.ethereum.org/EIPS/eip-4626) `withdraw` method,
or define a specific ratio.

Type `2C`: Time-Locked (Cooldown Period)

**Mechanism**: Shareholders can request an exit at any time, but the contract enforces a mandatory N-time cooldown before the funds are released. 
Used to prevent flash-loan attacks.
**Behavior**: This SHOULD give the `owner` sufficient warning to liquidate active trades gracefully without market slippage.

Type `2D`: Conditional (Dissolution / Milestone)

**Mechanism**: Exits are locked by default but can be triggered by specific on-chain conditions. 
For example, a specific timestamp is reached, a milestone boolean evaluates to false,
or the protocol is formally dissolved.
Acts as an emergency release valve or escrow refund mechanism.
**Behavior**: This MUST close all open policies,
block all future join actions, and keep exits open indefinitely.

#### The Base Exit Case

An open treasury that follows the tokenized reserve standard strictly,
by default restricts direct withdrawals.
Assets MAY be actively in use on different policy contracts,
which does not guarantee immediate 1:1 liquidity at all times.

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).

## References

- [ERC7425](https://eips.ethereum.org/EIPS/eip-7425)
- [ERC20](https://eips.ethereum.org/EIPS/eip-20)
- [ERC4626](https://eips.ethereum.org/EIPS/eip-4626)
