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
| where isnotempty(featureName) and isnotempty(featureValue) and isnotempty(event)
| project featureName, featureValue, event, totalPerFeature,totalPerEvent, percentageFired
| extend enabled = (featureValue == 'baseline.v1' or featureValue == 'featureB.v1')
| project featureName, enabled, event, totalPerFeature, totalPerEvent, percentageFired
| order by featureName`;

const encodedquery = encodeURIComponent(query.replace(/\n/, '').replace(/\s{2,}/, ''));

const appInsights = {
  url: `https://api.applicationinsights.io/beta/apps/${__InsightID}/query?query=${encodedquery}`,
  headers: {
  	'x-api-key': __InsightKey
  }
}

module.exports = appInsights;
