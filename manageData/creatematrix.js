const getFeaturesMatrix = (processData) => {
	return processData.reduce((featureList, obj) => {
	  if(featureList.indexOf(obj.featureName) === -1 ){
	     featureList.push(obj.featureName);
	   }
	   return featureList;
	},[]).map(feature => {
		return processData.filter(obj => obj.featureName === feature);
	});
}

const getListEvents = (processData) => {
	return processData.reduce((eventList, obj) => {
	  if(eventList.indexOf(obj.event) === -1 && obj.event.length >0){
	     eventList.push(obj.event);
	   }
	   return eventList;
	},[])
}

const splitEventPerFeature = (matrix, eventList) =>{
	return matrix.map(feature => {
	  return eventList.map(event => {
	   return feature.filter(obj =>{
	     if(event === obj.event) return obj;
	   })
	  })
	})
}

const createAttachObject = (processedData) =>{
 const matrix = getFeaturesMatrix(processedData);
 const eventListRetrieved = getListEvents(processedData);
 const eventPerFeature = splitEventPerFeature(matrix, eventListRetrieved);
 let attach = [];

 eventPerFeature.forEach(feature =>{
	 const myAttach = {};
	 myAttach.color = '#36a64f';
	 myAttach.pretext = feature[0][0].featureName;
	 myAttach.fields = [];
	 myAttach.fields.push({
	    "title": "Enabled",
	    "short": true
	    },
	    {
	    "title": "Disabled",
	    "short": true
	 })
	 feature.forEach(eventList =>{
	 		//When there is not data for both featureValues
	 		if(eventList.length == 1){
	 			eventList.push({
	 				event: eventList[0].event,
	 				totalPerFeature: 0,
	 				percentageFired: 0,
	 			});
	 		}
	    let n = eventList[0].enabled ? 0 : 1;
	    eventList.forEach(event =>{
	        myAttach.fields.push({
	        	"title": eventList[n].event , 
	        	"value": eventList[n].totalPerFeature + ' ('+parseFloat((eventList[n].percentageFired).toFixed(2))+'%)', 
	        	"short": true});
	        n ? --n : ++n;
	    })
	 })
	 attach.push(myAttach);
 })
 return attach;
}


module.exports = createAttachObject;