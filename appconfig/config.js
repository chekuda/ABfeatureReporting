const query = `let perEvent = customEvents
| where timestamp > ago(1d) 
| where name == 'panel.analytics.show'
| extend event = parsejson(tostring(customDimensions.['payload']))["eventType"]
| mvexpand customDimensions
| where customDimensions contains 'features.a'
| summarize count() by tostring(customDimensions), tostring(event)
| extend featureName = split(replace(@'{"|"}?', '',tostring(customDimensions)), ':' ,0)[0]
| extend featureValue = split(replace(@'{"|"}?', '',tostring(customDimensions)), ':' ,1)[0]
| project tostring(featureName), tostring(featureValue), event, count_ 
| summarize sum(count_) by featureName, event;

customEvents
| where timestamp > ago(1d) 
| where name == 'panel.analytics.show'
| extend event = parsejson(tostring(customDimensions.['payload']))["eventType"]
| mvexpand customDimensions
| where customDimensions contains 'features.a'
| summarize count() by tostring(customDimensions), tostring(event)
| extend featureName = split(replace(@'{"|"}?', '',tostring(customDimensions)), ':' ,0)[0]
| extend featureValue = split(replace(@'{"|"}?', '',tostring(customDimensions)), ':' ,1)[0]
| project tostring(featureName), tostring(featureValue), event, count_ 
| join kind=inner (
    perEvent
) on featureName, event
| project featureName, featureValue, event, totalPerFeature = count_ , totalPerEvent = sum_count_
| extend percentageFired = ((totalPerFeature+0.0)/totalPerEvent )*100
| project featureName, featureValue, event, totalPerFeature,totalPerEvent, percentageFired
| order by featureValue`;

const encodedquery = encodeURIComponent(query.replace(/\n/, '').replace(/\s{2,}/, ''));
const applicationID = 'ef8371a1-284f-425b-ad44-f687f047ef84';

const config = {
  appInsights: {
    queryUrl: `https://api.applicationinsights.io/beta/apps/${applicationID}/query?query=${encodedquery}`,
    appInsightsKey: 'sz0dgpdpfx17dfyvv2d6pcqcr2xxspc64o7yl88v',
    variables: {
      currentErrorCount: 'Tables.0.Rows.0.0',
      averageCount: 'Tables.0.Rows.0.1'
    }
  }
}

module.exports = config;
