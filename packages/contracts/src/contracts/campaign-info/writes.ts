import type { Address, Hex, WalletClient, Chain } from "../../lib";
import { CAMPAIGN_INFO_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import type { CampaignInfoWrites } from "./types";

/**
 * Builds write methods for a CampaignInfo contract instance.
 * @param address - Deployed CampaignInfo contract address
 * @param walletClient - Viem WalletClient used to call writeContract; must have an account attached
 * @param chain - Chain passed to writeContract for EIP-1559 and replay protection
 * @returns Write methods bound to the given contract address
 */
export function createCampaignInfoWrites(
  address: Address,
  walletClient: WalletClient | null,
  chain: Chain,
): CampaignInfoWrites {
  const contract = { address, abi: CAMPAIGN_INFO_ABI } as const;

  return {
    async updateDeadline(deadline: bigint) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "updateDeadline", args: [deadline] });
    },
    async updateGoalAmount(goalAmount: bigint) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "updateGoalAmount", args: [goalAmount] });
    },
    async updateLaunchTime(launchTime: bigint) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "updateLaunchTime", args: [launchTime] });
    },
    async updateSelectedPlatform(platformHash: Hex, selection: boolean, platformDataKey: readonly Hex[], platformDataValue: readonly Hex[]) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "updateSelectedPlatform", args: [platformHash, selection, [...platformDataKey], [...platformDataValue]] });
    },
    async setImageURI(newImageURI: string) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "setImageURI", args: [newImageURI] });
    },
    async updateContractURI(newContractURI: string) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "updateContractURI", args: [newContractURI] });
    },
    async mintNFTForPledge(backer: Address, reward: Hex, tokenAddress: Address, amount: bigint, shippingFee: bigint, tipAmount: bigint) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "mintNFTForPledge", args: [backer, reward, tokenAddress, amount, shippingFee, tipAmount] });
    },
    async burn(tokenId: bigint) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "burn", args: [tokenId] });
    },
    async pauseCampaign(message: Hex) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "_pauseCampaign", args: [message] });
    },
    async unpauseCampaign(message: Hex) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "_unpauseCampaign", args: [message] });
    },
    async cancelCampaign(message: Hex) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "_cancelCampaign", args: [message] });
    },
    async setPlatformInfo(platformBytes: Hex, platformTreasuryAddress: Address) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "_setPlatformInfo", args: [platformBytes, platformTreasuryAddress] });
    },
    async transferOwnership(newOwner: Address) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "transferOwnership", args: [newOwner] });
    },
    async renounceOwnership() {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "renounceOwnership", args: [] });
    },
  };
}
