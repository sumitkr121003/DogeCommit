const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  console.log("==================================================");
  console.log(" DogeCommitEscrow Deployment");
  console.log("==================================================");
  console.log(`Network:   ${networkName} (Chain ID: ${chainId})`);
  console.log(`Deployer:  ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Balance:   ${hre.ethers.formatEther(balance)} DOGE`);

  // Target Network: DogeOS Chikyū Testnet
  // DOGE ERC-20 interface address: 0x530000000000000000000000000000000000d09e
  const OFFICIAL_DOGEOS_DOGE = "0x530000000000000000000000000000000000d09e";
  let dogeTokenAddress = process.env.DOGE_TOKEN_ADDRESS || OFFICIAL_DOGEOS_DOGE;

  if (networkName === "hardhat" || networkName === "localhost") {
    console.log("\nLocal network detected: deploying TestDOGE...");
    const TestDOGE = await hre.ethers.getContractFactory("TestDOGE");
    const testDoge = await TestDOGE.deploy();
    await testDoge.waitForDeployment();
    dogeTokenAddress = await testDoge.getAddress();
    console.log(`TestDOGE deployed at: ${dogeTokenAddress}`);
  } else {
    console.log(`\nConfigured Native DOGE ERC-20 Address: ${dogeTokenAddress}`);
  }

  console.log("\nDeploying DogeCommitEscrow...");
  const DogeCommitEscrow = await hre.ethers.getContractFactory("DogeCommitEscrow");
  const escrow = await DogeCommitEscrow.deploy(dogeTokenAddress);
  await escrow.waitForDeployment();

  const escrowAddress = await escrow.getAddress();
  console.log(`\n>>> DogeCommitEscrow deployed successfully at: ${escrowAddress}`);

  // Save deployment metadata
  const deploymentData = {
    network: networkName,
    chainId: Number(chainId),
    escrowAddress,
    dogeTokenAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    rpcUrl: hre.network.config.url || "local",
    explorer: "https://dogeos-testnet.l2scan.co",
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
  console.log(`Deployment metadata saved to: ${filename}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
