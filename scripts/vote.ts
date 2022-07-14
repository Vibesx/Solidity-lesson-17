// vote on a proposal

import * as fs from "fs";
import { ethers, network } from "hardhat";
import { developmentChains, proposalsFile, VOTING_PERIOD } from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";

// get 1st proposal from proposals.json; for testing purposes it is hardcoded
const index = 0;

async function main(proposalIndex: number) {
	const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
	const proposalId = proposals[network.config.chainId!][proposalIndex];
	// 0 = Against, 1 = For, 2 = Abstain
	const voteWay = 1;
	const governor = await ethers.getContract("GovernorContract");
	const reason = "Just feel like it";
	const voteTxResponse = await governor.castVoteWithReason(proposalId, voteWay, reason);
	await voteTxResponse.wait(1);
	if (developmentChains.includes(network.name)) {
		await moveBlocks(VOTING_PERIOD + 1);
	}
	console.log("Voted! Ready to go!");
	// we can use await governor.state("<proposalId>") (in our case 51508501457481436077634888669578781761098444908194579718864424217340756472817)
	// in order to get the state of a proposal; more info in the Governor.sol contract and each number is associated to an enum value in IGovernor.sol -> ProposalState
}

main(index)
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
