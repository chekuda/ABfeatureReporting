require('dotenv').config({silent: true});

global.__InsightID = process.env.APP_ID;
global.__InsightKey = process.env.APP_CONECTION_KEY;

const rq = require('request');
const appInsightConfig = require('./appconfig/config');
const Slack = require('slack-node');
const creatematrix = require('./manageData/creatematrix');
const slackConfig = require('./slackNode/slackconfig');

function slackWebHook (dataFromAppIsights){
  const slack = new Slack();

  slack.setWebhook(slackConfig.webhookUrl);
  slackConfig.webhookMessage.attachments = dataFromAppIsights;
  slack.webhook(slackConfig.webhookMessage, function(err, response) {
    console.log(response);
  });
}

function callback (error, response, body){
  if (!error && response.statusCode == 200) {
      let info = JSON.parse(body).Tables[0];
      let processData = [];
      let rows = info.Rows;
      let columns = info.Columns;

      rows.forEach((item)=> {
        let obj = {};
        item.forEach((item, index) => {
          obj[columns[index].ColumnName]= item;
        });
        processData.push(obj);
      });
      slackWebHook(creatematrix(processData));
    }
}
rq(appInsightConfig, callback);
