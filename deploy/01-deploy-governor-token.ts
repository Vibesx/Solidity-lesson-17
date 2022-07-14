import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployGovernanceToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, deployments, network } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	log("Deploying Governance Token...");
	const governanceToken = await deploy("GovernanceToken", {
		from: deployer,
		args: [],
		log: true,
		waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
	});
	log(`GovernanceToken at ${governanceToken.address}`);
	if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		await verify(governanceToken.address, []);
	}
	log(`Delegating to ${deployer}`);
	await delegate(governanceToken.address, deployer);
	log("Delegated!");
};

// who do we want to be able to vote with our token
const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
	const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);
	const tx = await governanceToken.delegate(delegatedAccount);
	await tx.wait(1);
	console.log(`Checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`);
};

export default deployGovernanceToken;
