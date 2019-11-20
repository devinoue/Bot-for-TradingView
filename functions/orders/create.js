'use strict';

const resJson = require('../resJson');
const ccxt = require('ccxt');

// 売買ステータスを確認
const checkBot = require('./checkBot');

// 失敗時はメールを飛ばす
const sendEmail = require('./sendEmail');

module.exports.main = async event => {
  // ヘッダーを確認してアクセスを制限する

  if (event.source === 'serverless-plugin-warmup') {
    return resJson({ 'message':'' });
  }

  // 環境変数でコントロールできるようにする。
  if (process.env['IN_ACTION'] !== 'action') return resJson({ message:'not action end' });


  const bot = await checkBot();

  // 売買状態(none,buy,sell)
  const status = bot.BotStatus; 

  let accessFlag = false;

  accessFlag = true;

  // 特定ホストからのアクセスでない場合は弾く
  //if (!accessFlag) return resJson({ 'message': 'Do not valid' },403);

  console.log(event);
  console.log(event.headers);
  const pathParameters = event.pathParameters || { side: null };
  const side = pathParameters.side;



  // 状態が同じ場合は無視
  if (status === side) {
    console.log('状態維持: ' + side);
    return resJson({ 'message': 'Stay ' + side });
  }

  // オーダーサイズ
  const orderSize = process.env['ORDER_SIZE'];

  const config = {
    apiKey: process.env['API_KEY'],
    secret: process.env['API_SECRET'],
  };

  const bitflyer = new ccxt.bitflyer (config);

  let order = null;
  if (side === 'buy') {
    order = await bitflyer.createMarketBuyOrder('FX_BTC_JPY', orderSize);
    console.log(order);
  } else if (side === 'sell') {
    order = await bitflyer.createMarketSellOrder('FX_BTC_JPY', orderSize);
    console.log(order);
  } 

  if (order === null) return resJson({ message:'END' });

  if (order.status !== 200) {
    const errMes = order.error_message;
    if (errMes.includes('Margin amount')) {
      console.log('お金が足りない');
    } 
    console.log(errMes);
    const mailText = `
      エラーが起きました。理由は以下の通りです。
      状態 : ${side}
      ${errMes}
      `;
    const res = await sendEmail(mailText,process.env['ADMIN_EMAIL_ADDRESS']);
  }



  // 状態の保存
  const AWS = require('aws-sdk');
  const dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: 'ap-northeast-1',
  });

  const params = {
    TableName: process.env['TRADING_BOT_TABLE'], // DynamoDBのテーブル名
    Key: {
      Bot: 'bot1',
    },
    UpdateExpression: 'set BotStatus = :bs',

    ExpressionAttributeValues: {
      ':bs': side,
    },
  };

  // DynamoDBへのPut処理実行
  await dynamoDB
    .update(params)
    .promise()
    .catch(err => {
      console.log(err);
      return resJson({ 'error': err },400);
    });



  return resJson({ message:'OK' });

};
