# OpenTreasury

**⚠️ NOTE: ** Work Still in Progress. Incomplete :(

## Components

- [React Web Interface](/lib/ui-001)
- The contract used [Smart Contracts](lib/contracts)
    1 The deployment scripts for local envirnoments, [is here](lib/contracts/scripts)
    2 The deployment scripts for browser wallet deployment [is here](lib/web-ui/ui-001/src/blockchain)
 - 

## Description

### Chainlink Integration

Chainlink Automation is used to automate some of the smart contract tasks.
For the [JoinPool.sol](lib/contracts/policy/JoinPool.sol) contract Chainlink Automation is used to send funds to a authorized pools and to leave a pool when after the proposed time has occured. These functions are [located here](lib/contracts/policy/JoinPool.sol#L).
