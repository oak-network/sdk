/**
 * TreasuryFactory ABI — from provided ITreasuryFactory + TreasuryFactory.sol.
 * UUPS; initialize(globalParams); register/approve/disapprove/remove implementation; deploy returns address.
 */
export const TREASURY_FACTORY_ABI = [
  { inputs: [], name: "AdminAccessCheckerUnauthorized", type: "error" },
  { inputs: [], name: "TreasuryFactoryUnauthorized", type: "error" },
  { inputs: [], name: "TreasuryFactoryInvalidKey", type: "error" },
  { inputs: [], name: "TreasuryFactoryTreasuryCreationFailed", type: "error" },
  { inputs: [], name: "TreasuryFactoryInvalidAddress", type: "error" },
  { inputs: [], name: "TreasuryFactoryImplementationNotSet", type: "error" },
  { inputs: [], name: "TreasuryFactoryImplementationNotSetOrApproved", type: "error" },
  { inputs: [], name: "TreasuryFactoryTreasuryInitializationFailed", type: "error" },
  { inputs: [], name: "TreasuryFactorySettingPlatformInfoFailed", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "platformHash", type: "bytes32" },
      { indexed: true, internalType: "uint256", name: "implementationId", type: "uint256" },
      { indexed: true, internalType: "address", name: "infoAddress", type: "address" },
      { indexed: false, internalType: "address", name: "treasuryAddress", type: "address" },
    ],
    name: "TreasuryFactoryTreasuryDeployed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "platformHash", type: "bytes32" },
      { indexed: true, internalType: "uint256", name: "implementationId", type: "uint256" },
      { indexed: true, internalType: "address", name: "implementation", type: "address" },
    ],
    name: "TreasuryImplementationRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "platformHash", type: "bytes32" },
      { indexed: true, internalType: "uint256", name: "implementationId", type: "uint256" },
    ],
    name: "TreasuryImplementationRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "implementation", type: "address" },
      { indexed: false, internalType: "bool", name: "isApproved", type: "bool" },
    ],
    name: "TreasuryImplementationApproval",
    type: "event",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "platformHash", type: "bytes32" },
      { internalType: "uint256", name: "implementationId", type: "uint256" },
      { internalType: "address", name: "implementation", type: "address" },
    ],
    name: "registerTreasuryImplementation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "platformHash", type: "bytes32" },
      { internalType: "uint256", name: "implementationId", type: "uint256" },
    ],
    name: "approveTreasuryImplementation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "implementation", type: "address" }],
    name: "disapproveTreasuryImplementation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "platformHash", type: "bytes32" },
      { internalType: "uint256", name: "implementationId", type: "uint256" },
    ],
    name: "removeTreasuryImplementation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "platformHash", type: "bytes32" },
      { internalType: "address", name: "infoAddress", type: "address" },
      { internalType: "uint256", name: "implementationId", type: "uint256" },
    ],
    name: "deploy",
    outputs: [{ internalType: "address", name: "clone", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "contract IGlobalParams", name: "globalParams", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
