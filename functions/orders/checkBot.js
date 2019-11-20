'use strict';

/*!
 * @author Masaharu Inoue <pasteur1822@gmail.com>
 * date 11/20/2019
 * 指定されたテーブルが現在の状態を取得して返却
 */
module.exports = async function () {

  const AWS = require('aws-sdk');
  const dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: 'ap-northeast-1',
  });


  const params_ch = {
    'TableName': process.env['TRADING_BOT_TABLE'], // DynamoDBのテーブル名
    'KeyConditionExpression': 'Bot = :bot',

    'ExpressionAttributeValues': {
      ':bot': 'bot1',
    },
    'ScanIndexForward': false,
  };


  return new Promise(async function (resolve, reject) {
    dynamoDB.query(params_ch).promise().then((data) => {
      resolve(data.Items[0]);

    }).catch((err) => {
      console.error(err);
      reject(err);
    });
  });

};
