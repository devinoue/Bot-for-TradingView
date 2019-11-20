'use strict';

/*!
 * @author Masaharu Inoue <pasteur1822@gmail.com>
 * date 11/21/2019
 * 与えられたテキストデータを指定したメールアドレスに送信する。
 */
module.exports = async function (textBody,emailAddress) {

  const AWS_SES = require('aws-sdk');
  
  const message = {
    'mailSubject':'Error report',
    'mailMessage':textBody,
    'email':[emailAddress],
  };
  var lambda = new AWS_SES.Lambda({ apiVersion: '2015-03-31' });
  
  var params = {
    FunctionName: 'pushEmail',
    InvocationType: 'RequestResponse', //同期呼出
    Payload: JSON.stringify(message),
  };
  
  await lambda.invoke(params).promise().then(() => {
    console.log('invoke done');
    return true;
  });
};
