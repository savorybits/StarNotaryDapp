const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    const tokenId = 123;
    const starName = 'test star 123';
    const instance = await StarNotary.deployed();
    await instance.createStar(starName, tokenId);
    const lookupName = await instance.lookUptokenIdToStarInfo(tokenId);
    assert.equal(starName, lookupName);

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    const instanceName = await instance.name.call();
    const instanceSymbol = await instance.symbol.call();
    assert.equal(instanceName, "Star Yeoman");
    assert.equal(instanceSymbol, "STARYEO");
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    const tokenId1 = 11;
    const starName1 = "star11";
    const owner1 = accounts[1];

    const tokenId2 = 22; 
    const starName2 = "star22";
    const owner2 = accounts[2];

    const instance = await StarNotary.deployed();
    await instance.createStar(starName1, tokenId1, {from: owner1});
    await instance.createStar(starName2, tokenId2, {from: owner2});

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(tokenId1, tokenId2, {from: owner1});
    
    // 3. Verify that the owners changed
    const newOwner1 = await instance.ownerOf(tokenId1);
    const newOwner2 = await instance.ownerOf(tokenId2);
    assert.equal(owner1, newOwner2);
    assert.equal(owner2, newOwner1);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    const tokenId = 33;
    const starName = "star33";
    const owner1 = accounts[1];
    const owner2 = accounts[2];
    const instance = await StarNotary.deployed();
    await instance.createStar(starName, tokenId, {from: owner1});

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(owner2, tokenId, {from: owner1});

    // 3. Verify the star owner changed.
    const newOwner = await instance.ownerOf(tokenId);
    assert.equal(owner2, newOwner);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    const tokenId = 44;
    const starName = "star44";
    const owner = accounts[0];
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    const instance = await StarNotary.deployed();
    await instance.createStar(starName, tokenId, {from: owner});
    const lookupName = await instance.lookUptokenIdToStarInfo(tokenId);
    assert.equal(lookupName, starName); 
});