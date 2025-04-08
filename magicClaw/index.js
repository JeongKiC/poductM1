const express = require('express');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');

const app = express();
const port = 3001;  

// 미들웨어 설정
app.use(bodyParser.json());
app.use(express.static('public'));

// 트랜잭션 클래스 정의
class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
  }
}

// 블록 클래스 정의
class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  // 블록의 해시값 계산
  calculateHash() {
    return CryptoJS.SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  // 작업 증명 (난이도에 따라 해시값 앞에 0이 필요한 개수 결정)
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log('블록 채굴: ' + this.hash);
  }
}

// 블록체인 클래스 정의
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100; // 채굴 보상
  }

  // 제네시스 블록 생성
  createGenesisBlock() {
    return new Block(Date.now(), [], '0');
  }

  // 가장 최근 블록 가져오기
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // 트랜잭션 추가
  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('트랜잭션에는 송신자와 수신자가 필요합니다.');
    }

    if (transaction.amount <= 0) {
      throw new Error('트랜잭션 금액은 0보다 커야 합니다.');
    }

    // 잔액 확인 (실제 구현에서는 더 복잡한 검증 필요)
    if (transaction.fromAddress !== 'system') {
      const balance = this.getBalanceOfAddress(transaction.fromAddress);
      if (balance < transaction.amount) {
        throw new Error('잔액이 부족합니다.');
      }
    }

    this.pendingTransactions.push(transaction);
  }

  // 채굴 보상 지급
  minePendingTransactions(miningRewardAddress) {
    // 채굴 보상 트랜잭션 생성
    const rewardTx = new Transaction('system', miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    // 새 블록 생성 및 추가
    const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    console.log('블록이 성공적으로 채굴되었습니다!');
    this.chain.push(block);
    this.pendingTransactions = [];
  }

  // 주소의 잔액 확인
  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  // 블록체인 유효성 검사
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

// 블록체인 인스턴스 생성
const magicCoin = new Blockchain();

// API 엔드포인트: 블록체인 상태 확인
app.get('/api/blockchain', (req, res) => {
  res.json({
    chain: magicCoin.chain,
    isValid: magicCoin.isChainValid(),
    pendingTransactions: magicCoin.pendingTransactions
  });
});

// API 엔드포인트: 새 트랜잭션 추가
app.post('/api/transaction', (req, res) => {
  const { fromAddress, toAddress, amount } = req.body;
  
  if (!fromAddress || !toAddress || !amount) {
    return res.status(400).json({ error: '송신자, 수신자, 금액이 필요합니다.' });
  }

  try {
    const transaction = new Transaction(fromAddress, toAddress, amount);
    magicCoin.addTransaction(transaction);
    
    res.json({
      message: '트랜잭션이 추가되었습니다.',
      transaction
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API 엔드포인트: 블록 채굴
app.post('/api/mine', (req, res) => {
  const { miningRewardAddress } = req.body;
  
  if (!miningRewardAddress) {
    return res.status(400).json({ error: '채굴 보상 주소가 필요합니다.' });
  }

  try {
    magicCoin.minePendingTransactions(miningRewardAddress);
    
    res.json({
      message: '블록이 성공적으로 채굴되었습니다.',
      block: magicCoin.getLatestBlock()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API 엔드포인트: 주소 잔액 확인
app.get('/api/balance/:address', (req, res) => {
  const { address } = req.params;
  
  if (!address) {
    return res.status(400).json({ error: '주소가 필요합니다.' });
  }

  const balance = magicCoin.getBalanceOfAddress(address);
  
  res.json({
    address,
    balance
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`매직 코인 서버가 포트 ${port}에서 실행 중입니다.`);
}); 