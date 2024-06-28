// npx ts-node src/<example-file>.ts
import {
  Contract,
  JsonRpcProvider,
  Wallet,
  formatEther,
  parseEther,
  getAddress,
  parseUnits,
} from "ethers";

const Constants = {
  WETH: getAddress("0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f"),
  ezEth: getAddress("0x2416092f143378750bb29b79ed961ab195cceea5"),
  lynex: getAddress("0x1a51b19CE03dbE0Cb44C1528E34a7EDD7771E9Af"),
  router: getAddress("0x610D2f07b7EdC67565160F587F37636194C34E74"),
  myWallet: getAddress("0x7C09b8fE224591E797c533Bb74f0eF79077c3f9C"), // Change this to your address ELSE YOU GONNA SEND YOUR BEANS TO ME
}

const SWAP_ABI = [
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
];

const privateKey = "my_private_key";
const provider = new JsonRpcProvider('https://1rpc.io/linea');
const walletSigner = new Wallet(privateKey,provider);

const swapLynex = new Contract(Constants.router, SWAP_ABI, provider);
const swapContractWithWallet = swapLynex.connect(walletSigner); // make it writable

const main = async () => {
  const currentBlockNumber = await provider.getBlockNumber();
  console.log("currentBlockNumber: ", currentBlockNumber);
  provider.getFeeData().then(console.log);

  const tokenA = Constants.WETH;
  const tokenB = Constants.lynex;
  const EthAmount = parseEther('0.0003'); //.toHexString();
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; 
  const tx = await (swapContractWithWallet as Contract).swapExactETHForTokens(
    0,
    [tokenA, tokenB],
    Constants.myWallet,
    deadline, // 10 minutes from now
    {
      value: EthAmount, // the amount of ether you want to swap
      gasLimit: 300000,
      gasPrice: parseUnits('50', 'gwei'), // Set a reasonable gas price (in wei)
    }
  );
  console.log("Transaction Hash:", tx.hash);
  const receipt = await tx.wait();
  console.log(`Transaction hash: ${receipt.transactionHash}`);
  console.log("snipe done!");
}

main().catch((e) => {console.log(e)});
