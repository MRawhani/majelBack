const moment = require('moment')

const companyCategories = ["إحتفالات" ,  "فنادق", "رحلات","عيادات"];
const checkIfDatesAreValid = function (date){
    var formats = [
        moment.ISO_8601,
        "YYYY/MM/DD",
        "YYYY/MM/D"
    ];
   return date != ''
}

const  getAvailableTimes=function(period){
    const time = moment(period.startingTime,'HH:mm');
    const time2 = moment(period.endingTime,'HH:mm');
    
    let temp = time;
    let availableTimes=[]
    while(!temp.isSame(time2)){
      availableTimes.push(temp.format("HH:mm"))
      temp= time.add(30,'m')
    }
    !availableTimes.includes(period.endingTime) && availableTimes.push(period.endingTime)
    console.log( availableTimes);
    return availableTimes
   }
const generateCodedNumber = function(number){
   let code = ''
   let convertedNumber= number.toString();
    for(let i= 0;i < (convertedNumber.length-2);i++){
        code = code + '*'
    }
    code = code + `${convertedNumber[convertedNumber.length-1]+convertedNumber[convertedNumber.length-2]}`
    return code
}
module.exports ={ 
    companyCategories,
    checkIfDatesAreValid,
    getAvailableTimes,
    generateCodedNumber
}