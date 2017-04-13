const rq = require('request');
const config = require('./appconfig/config');
const creatematrix = require('./manageData/creatematrix');

var options = {
  url: config.appInsights.queryUrl,
  headers: {
    'x-api-key': config.appInsights.appInsightsKey
  }
};
 
function callback(error, response, body) {
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
      console.log(creatematrix(processData));
    }
}
 
rq(options, callback);
