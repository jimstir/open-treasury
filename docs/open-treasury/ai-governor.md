---
title: AI-GOVERNOR
name: The AI Governor
status: draft
category: Standards Track
contributors: jimstir
---

## Abstract

This specification describes the AI governor mechanism designed to operate as the owner of an [Open Treasury](./open-treasury.md).
The AI Governor introduces a LLM-driven system that is authroized to handle all tasks required by the owner of an treasury,
while remaining transparent and
auditable by all stakeholders of the treasury.

## Background

While the Open Treasury standard provides a transparent and
democratic process for blockchain treasuries.
The protocol requires treasuries to have shareholders or
owners to manually create proposals,
monitor markets, and execute transactions.
This can cause some treasuries to missed opportunities because of the reliance on human action.
A AI Governor is a AI-powered authorized treasury owner,
assigned by the orginial treasury owner.
This agent acts as an autonomous owner of the open treasury.
Shareholders can trust a treasuries AI governor as the is bound by the same restrictions as the human owner.
The goal is to maximize treasury growth through active AI management,
without sacrificing the transparent nature of the [Open Treasury](./open-treasury.md).

## Specification

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED",  "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
[RFC 2119](http://tools.ietf.org/html/rfc2119).

Each AI Governor implementation SHOULD consist of an off-chain decision loop
and an on-chain security checks.


### The Decision Loop

The AI Governor MUST operate via a deterministic decision loop that abstracts the underlying smart contracts from the Large Language Model (LLM). This loop consists of the following modular interfaces:
1. **`IStateProvider`**: Fetches the current state of the treasury (e.g., token balances via ERC20 view functions) and current market data. It MUST cross-reference a whitelisted set of approved tokens.
2. **`ILLMProvider`**: Submits the state to an AI LLM for reasoning.
3. **`RiskEngine`**: A deterministic ruleset that evaluates the AI's response against defined treasury goals.
4. **`AIProposal`**: If the risk checks pass, this module MUST interact with the Open Treasury to open a formal proposal (`proposalOpen`).
5. **`AIExecute`**: Once a proposal is approved by shareholders, this module executes the trade via a compliant policy contract.

### Agent Funding & Security Safeguards

To prevent a compromised AI agent from draining treasury funds,
the AI Governor MUST adhere to security checks.

#### Ethereum Gas Escrow

The owner MAY deploy an `AgentGasEscrow` smart contract.
This contract acts as a smart wallet that holds the agent's gas budget.

- **Proposal Gas:** The escrow SHOULD enforce a time-based rate limit (e.g., once every 24 hours) matching the agent's scheduled invocation frequency before releasing gas to open a new proposal.
- **Execution Gas:** Before releasing gas for trade execution, the escrow MUST verify on-chain that the specific proposal has been approved by the Open Treasury (`proposalApproved`) and has not yet been executed.

#### LLM Inference Billing

LLM request payments SHOULD be transparently shared with shareholders.
It is the responsibility of shareholders to verify a treasuries AI LLM request costs.

### The Policy Interaction

When the AI Governor decides to execute a proposal,
it MUST do so through an Open Treasury Compliant Policy.
The AI Governor generates the necessary calldata 
and submits it to the policy.
The policy contract MUST enforce that the tokens transferred out of the treasury are securely used within the defined policy and
that tokens are deposited back into the tokenized reserve at the desired time.

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).

## References

- [Open Treasury Standard](./open-treasury.md)