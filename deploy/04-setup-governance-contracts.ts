import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ADDRESS_ZERO } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const setupContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, deployments, network } = hre;
	const { deploy, log, get } = deployments;
	const { deployer } = await getNamedAccounts();
	const timeLock = await ethers.getContract("TimeLock", deployer);
	const governor = await ethers.getContract("GovernorContract", deployer);

	log("Setting up roles...");
	const proposerRole = await timeLock.PROPOSER_ROLE();
	const executorRole = await timeLock.EXECUTOR_ROLE();
	const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

	// we grant the proposal role to the governor
	const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
	await proposerTx.wait(1);
	// we grant the executor role to everybody
	const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
	await executorTx.wait(1);
	// after doing all the role granting, we need to revoke the admin role of the deployer from the timelock contract, so that only the TimeLock contract can have admin rights
	const revokeTx = await timeLock.revokeRole(adminRole, deployer);
	await revokeTx.wait(1);
};

export default setupContracts;
