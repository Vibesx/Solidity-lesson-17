import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import {
	networkConfig,
	developmentChains,
	VOTING_PERIOD,
	VOTING_DELAY,
	QUORUM_PERCENTAGE,
} from "../helper-hardhat-config";

const deployGovernorContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, deployments, network } = hre;
	const { deploy, log, get } = deployments;
	const { deployer } = await getNamedAccounts();
	const governanceToken = await get("GovernanceToken");
	const timeLock = await get("TimeLock");

	log("Deploying Governor Contract...");
	const governorContract = await deploy("GovernorContract", {
		from: deployer,
		args: [
			governanceToken.address,
			timeLock.address,
			VOTING_DELAY,
			VOTING_PERIOD,
			QUORUM_PERCENTAGE,
		],
		log: true,
		waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
	});
	log(`GovernanceToken at ${governorContract.address}`);
	if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		await verify(governorContract.address, []);
	}
};

export default deployGovernorContract;
