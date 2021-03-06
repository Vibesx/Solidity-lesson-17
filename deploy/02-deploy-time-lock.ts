import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { networkConfig, developmentChains, MIN_DELAY } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployTimeLock: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, deployments, network } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	log("Deploying Timelock...");
	const timeLock = await deploy("TimeLock", {
		from: deployer,
		args: [MIN_DELAY, [], []],
		log: true,
		waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
	});
	log(`GovernanceToken at ${timeLock.address}`);
	if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		await verify(timeLock.address, []);
	}
};

export default deployTimeLock;
