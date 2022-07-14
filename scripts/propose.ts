// propose a change to our contract

import { ethers, network } from "hardhat";
import {
	NEW_STORE_VALUE,
	FUNC,
	PROPOSAL_DESCRIPTION,
	developmentChains,
	VOTING_DELAY,
	proposalsFile,
} from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import * as fs from "fs";

export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
	const governor = await ethers.getContract("GovernorContract");
	const box = await ethers.getContract("Box");
	// more about encodeFunctionData in ethers docs; it basically returns the function (including params, which are args) as bytes
	// this can then be decoded with similar decode functions in ethers (see docs)
	const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args);
	console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`);
	console.log(`Proposal Description: \n ${proposalDescription}`);
	const proposeTx = await governor.propose(
		[box.address],
		[0],
		[encodedFunctionCall],
		proposalDescription
	);
	const proposeReceipt = await proposeTx.wait(1);

	if (developmentChains.includes(network.name)) {
		await moveBlocks(VOTING_DELAY + 1);
	}

	const proposalId = proposeReceipt.events[0].args.proposalId;
	let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
	// ! is a way to say that chainId will have a value (required / won't be null)
	proposals[network.config.chainId!.toString()].push(proposalId.toString());
	fs.writeFileSync(proposalsFile, JSON.stringify(proposals));
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
