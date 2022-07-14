import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, deployments, network } = hre;
	const { deploy, log, get } = deployments;
	const { deployer } = await getNamedAccounts();

	log("Deploying Box...");
	// this is a deployment object, not an actual contract (with functions and stuff)
	const box = await deploy("Box", {
		from: deployer,
		args: [],
		log: true,
		waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
	});
	// the deployer has deployed the box, so we need to give the ownership over to timelock
	const timeLock = await ethers.getContract("TimeLock");
	// here we get the actual box contract
	const boxContract = await ethers.getContractAt("Box", box.address);
	const transferOwnerTx = await boxContract.transferOwnership(timeLock.address);
	await transferOwnerTx.wait(1);

	log(`GovernanceToken at ${box.address}`);
	if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		await verify(box.address, []);
	}
};

export default deployBox;
