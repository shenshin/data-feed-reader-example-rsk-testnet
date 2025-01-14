const hre = require('hardhat');

async function main() {
  const DataFeedReaderExample = await hre.deployments.get('DataFeedReaderExample');
  const dataFeedReaderExample = new hre.ethers.Contract(
    DataFeedReaderExample.address,
    DataFeedReaderExample.abi,
    hre.ethers.provider
  );
  const selfServeDapiServerWhitelisterAddressOnRskTestnet = '0x928922A4e2D3f96Ce72002A5EA7481BEF4F12fD6';
  const selfServeDapiServerWhitelisterAbi = [
    'function allowToReadDataFeedWithIdFor30Days(bytes32 dataFeedId, address reader) public',
    'function allowToReadDataFeedWithDapiNameFor30Days(bytes32 dapiName, address reader) external',
  ];
  const selfServeDapiServerWhitelister = new hre.ethers.Contract(
    selfServeDapiServerWhitelisterAddressOnRskTestnet,
    selfServeDapiServerWhitelisterAbi,
    (await hre.ethers.getSigners())[0]
  );
  const dataFeedId = process.env.DATA_FEED_ID;
  if (!dataFeedId) {
    throw new Error('Data feed ID not defined');
  }
  const receipt = await selfServeDapiServerWhitelister.allowToReadDataFeedWithIdFor30Days(
    dataFeedId,
    DataFeedReaderExample.address
  );
  await new Promise((resolve) =>
    hre.ethers.provider.once(receipt.hash, () => {
      resolve();
    })
  );
  const accessStatus = await dataFeedReaderExample.dataFeedIdToReaderToWhitelistStatus(
    dataFeedId,
    dataFeedReaderExample.address
  );
  console.log(
    `DataFeedReaderExample is allowed to read the data feed with ID ${dataFeedId} until ${new Date(
      accessStatus.expirationTimestamp.toNumber() * 1000
    ).toISOString()}. It is granted indefinite access ${accessStatus.indefiniteWhitelistCount} times.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
