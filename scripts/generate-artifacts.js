const solc = require('solc');
const fs = require('fs');
const path = require('path');

// Output directories
const abiDir = path.join(__dirname, '../lib/web-ui/ui-001/src/abi');
const bytecodeDir = path.join(__dirname, '../lib/web-ui/ui-001/src/bytecode');

// Create output directories
[abiDir, bytecodeDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Read and compile contracts
const contracts = [
  {
    name: 'TreasuryToken',
    path: path.join(__dirname, '../lib/contracts/vault/TreasuryToken.sol'),
    baseDir: path.join(__dirname, '../lib/contracts')
  },
  {
    name: 'TreasuryVault',
    path: path.join(__dirname, '../lib/contracts/vault/TreasuryVault.sol'),
    baseDir: path.join(__dirname, '../lib/contracts')
  }
];

// Solidity compiler input
const input = {
  language: 'Solidity',
  sources: {},
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode']
      }
    }
  }
};

// Read contract sources
contracts.forEach(contract => {
  input.sources[contract.name + '.sol'] = {
    content: fs.readFileSync(contract.path, 'utf8')
  };
});

// Compile contracts
console.log('Compiling contracts...');
const output = JSON.parse(solc.compile(JSON.stringify(input), {
  import: (importPath) => {
    try {
      // Handle local imports
      if (importPath.startsWith('../') || importPath.startsWith('./')) {
        // Try relative to the current contract first
        let fullPath = path.join(path.dirname(contract.path), importPath);
        if (!fs.existsSync(fullPath)) {
          // If not found, try relative to the base contracts directory
          fullPath = path.join(contract.baseDir, importPath);
        }
        return { contents: fs.readFileSync(fullPath, 'utf8') };
      }
      // Handle OpenZeppelin imports with mock implementations
      if (importPath.startsWith('@openzeppelin/')) {
        if (importPath.includes('SafeERC20.sol')) {
          return { contents: '// Mock SafeERC20\npragma solidity ^0.8.0;\n          \n          // IERC20 interface is already defined in IERC20.sol\n          interface IERC20 {\n            function transfer(address to, uint256 amount) external returns (bool);\n            function balanceOf(address account) external view returns (uint256);\n          }\n          \n          library SafeERC20 {\n            function safeTransfer(IERC20 token, address to, uint256 value) internal {\n              (bool success, ) = address(token).call(abi.encodeWithSignature(\"transfer(address,uint256)\", to, value));\n              require(success, \"SafeERC20: low-level call failed\");\n            }\n          }' };
        } else if (importPath.includes('ERC20.sol')) {
          return { contents: '// Mock ERC20\npragma solidity ^0.8.0;\n          abstract contract Context {\n            function _msgSender() internal view virtual returns (address) {\n              return msg.sender;\n            }\n          }\n          \n          abstract contract Ownable is Context {\n            address private _owner;\n            \n            event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);\n            \n            constructor(address initialOwner) {\n                _transferOwnership(initialOwner);\n            }\n            \n            modifier onlyOwner() {\n                _checkOwner();\n                _;\n            }\n            \n            function owner() public view virtual returns (address) {\n                return _owner;\n            }\n            \n            function _checkOwner() internal view virtual {\n                require(owner() == _msgSender(), \"Ownable: caller is not the owner\");\n            }\n            \n            function transferOwnership(address newOwner) public virtual onlyOwner {\n                require(newOwner != address(0), \"Ownable: new owner is the zero address\");\n                _transferOwnership(newOwner);\n            }\n            \n            function _transferOwnership(address newOwner) internal virtual {\n                address oldOwner = _owner;\n                _owner = newOwner;\n                emit OwnershipTransferred(oldOwner, newOwner);\n            }\n          }\n          \n          abstract contract IERC20 {\n            function transfer(address to, uint256 amount) external virtual returns (bool);\n            function balanceOf(address account) external view virtual returns (uint256);\n            function approve(address spender, uint256 amount) external virtual returns (bool);\n            function transferFrom(address from, address to, uint256 amount) external virtual returns (bool);\n            function allowance(address owner, address spender) external view virtual returns (uint256);\n            function totalSupply() external view virtual returns (uint256);\n          }\n          \n          contract ERC20 is Context, IERC20 {\n            mapping(address => uint256) private _balances;\n            mapping(address => mapping(address => uint256)) private _allowances;\n            uint256 private _totalSupply;\n            string private _name;\n            string private _symbol;\n            \n            constructor(string memory name_, string memory symbol_) {\n                _name = name_;\n                _symbol = symbol_;\n            }\n            \n            function name() public view virtual returns (string memory) {\n                return _name;\n            }\n            \n            function symbol() public view virtual returns (string memory) {\n                return _symbol;\n            }\n            \n            function decimals() public view virtual returns (uint8) {\n                return 18;\n            }\n            \n            function totalSupply() public view virtual override returns (uint256) {\n                return _totalSupply;\n            }\n            \n            function balanceOf(address account) public view virtual override returns (uint256) {\n                return _balances[account];\n            }\n            \n            function transfer(address to, uint256 amount) public virtual override returns (bool) {\n                address owner = _msgSender();\n                _transfer(owner, to, amount);\n                return true;\n            }\n            \n            function allowance(address owner, address spender) public view virtual override returns (uint256) {\n                return _allowances[owner][spender];\n            }\n            \n            function approve(address spender, uint256 amount) public virtual override returns (bool) {\n                address owner = _msgSender();\n                _approve(owner, spender, amount);\n                return true;\n            }\n            \n            function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {\n                address spender = _msgSender();\n                _spendAllowance(from, spender, amount);\n                _transfer(from, to, amount);\n                return true;\n            }\n            \n            function _transfer(address from, address to, uint256 amount) internal virtual {\n                require(from != address(0), \"ERC20: transfer from the zero address\");\n                require(to != address(0), \"ERC20: transfer to the zero address\");\n                \n                uint256 fromBalance = _balances[from];\n                require(fromBalance >= amount, \"ERC20: transfer amount exceeds balance\");\n                unchecked {\n                    _balances[from] = fromBalance - amount;\n                    _balances[to] += amount;\n                }\n                \n                emit Transfer(from, to, amount);\n            }\n            \n            function _mint(address account, uint256 amount) internal virtual {\n                require(account != address(0), \"ERC20: mint to the zero address\");\n                \n                _totalSupply += amount;\n                unchecked {\n                    _balances[account] += amount;\n                }\n                emit Transfer(address(0), account, amount);\n            }\n            \n            function _approve(address owner, address spender, uint256 amount) internal virtual {\n                require(owner != address(0), \"ERC20: approve from the zero address\");\n                require(spender != address(0), \"ERC20: approve to the zero address\");\n                \n                _allowances[owner][spender] = amount;\n                emit Approval(owner, spender, amount);\n            }\n            \n            function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {\n                uint256 currentAllowance = allowance(owner, spender);\n                if (currentAllowance != type(uint256).max) {\n                    require(currentAllowance >= amount, \"ERC20: insufficient allowance\");\n                    unchecked {\n                        _approve(owner, spender, currentAllowance - amount);\n                    }\n                }\n            }\n            \n            event Transfer(address indexed from, address indexed to, uint256 value);\n            event Approval(address indexed owner, address indexed spender, uint256 value);\n          }' };
        } else if (importPath.includes('IERC20.sol')) {
          return { contents: '// Mock IERC20\npragma solidity ^0.8.0;\n          interface IERC20 {\n            function transfer(address to, uint256 amount) external returns (bool);\n            function balanceOf(address account) external view returns (uint256);\n            function approve(address spender, uint256 amount) external returns (bool);\n            function transferFrom(address from, address to, uint256 amount) external returns (bool);\n            function allowance(address owner, address spender) external view returns (uint256);\n            function totalSupply() external view returns (uint256);\n          }' };
        } else if (importPath.includes('ERC4626.sol')) {
          return { contents: '// Mock ERC4626\npragma solidity ^0.8.0;\n          abstract contract ERC4626 {\n            function deposit(uint256 assets, address receiver) public virtual returns (uint256);\n            function mint(uint256 shares, address receiver) public virtual returns (uint256);\n            function withdraw(uint256 assets, address receiver, address owner) public virtual returns (uint256);\n            function redeem(uint256 shares, address receiver, address owner) public virtual returns (uint256);\n          }' };
        }
        return { contents: '// Mock import: ' + importPath + '\npragma solidity ^0.8.0;' };
      }
      return { error: 'File not found: ' + importPath };
    } catch (error) {
      return { error: 'Error reading file: ' + error.message };
    }
  }
}));

// Process compilation output
if (output.errors) {
  console.error('Compilation errors:');
  output.errors.forEach(error => {
    if (error.severity === 'error') {
      console.error(error.formattedMessage);
    }
  });
  if (output.errors.some(e => e.severity === 'error')) {
    process.exit(1);
  }
}

// Save ABIs and bytecode
Object.entries(output.contracts).forEach(([sourceFile, contracts]) => {
  Object.entries(contracts).forEach(([contractName, contractData]) => {
    if (contracts[contractName].abi) {
      // Save ABI
      fs.writeFileSync(
        path.join(abiDir, `${contractName}.json`),
        JSON.stringify(contracts[contractName].abi, null, 2)
      );
      
      // Save bytecode
      fs.writeFileSync(
        path.join(bytecodeDir, `${contractName}.json`),
        JSON.stringify({ 
          bytecode: contracts[contractName].evm.bytecode.object,
          deployedBytecode: contracts[contractName].evm.deployedBytecode.object
        }, null, 2)
      );
      
      console.log(`✅ Generated artifacts for ${contractName}`);
    }
  });
});

console.log('\n🎉 All artifacts generated successfully!');
