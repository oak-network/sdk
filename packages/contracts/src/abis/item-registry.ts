const ITEM_COMPONENTS = [
  { internalType: "uint256", name: "actualWeight", type: "uint256" },
  { internalType: "uint256", name: "height", type: "uint256" },
  { internalType: "uint256", name: "width", type: "uint256" },
  { internalType: "uint256", name: "length", type: "uint256" },
  { internalType: "bytes32", name: "category", type: "bytes32" },
  { internalType: "bytes32", name: "declaredCurrency", type: "bytes32" },
] as const;

export const ITEM_REGISTRY_ABI = [
  { inputs: [], name: "ItemRegistryMismatchedArraysLength", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "bytes32", name: "itemId", type: "bytes32" },
      {
        components: ITEM_COMPONENTS,
        indexed: false,
        internalType: "struct IItem.Item",
        name: "item",
        type: "tuple",
      },
    ],
    name: "ItemAdded",
    type: "event",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "itemId", type: "bytes32" },
      {
        components: ITEM_COMPONENTS,
        internalType: "struct IItem.Item",
        name: "item",
        type: "tuple",
      },
    ],
    name: "addItem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32[]", name: "itemIds", type: "bytes32[]" },
      {
        components: [...ITEM_COMPONENTS],
        internalType: "struct IItem.Item[]",
        name: "items",
        type: "tuple[]",
      },
    ],
    name: "addItemsBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "bytes32", name: "itemId", type: "bytes32" },
    ],
    name: "getItem",
    outputs: [
      {
        components: ITEM_COMPONENTS,
        internalType: "struct IItem.Item",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
