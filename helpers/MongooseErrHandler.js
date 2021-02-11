module.exports= {
    normalizeErrors: function(errors){

        let errorsArray = [];

        for(let property in errors){
            if(errors.hasOwnProperty(property)){
                errorsArray.push({title: property,success:false, message: errors[property].message})
            } 
        }
        return errorsArray;
    }, 
    normalizeErrorsofToken: function(errors){
        let errorsArray = [];

        for(let property in errors){
            if(errors.hasOwnProperty(property)){
                errorsArray.push({title: property['name'] || 'Unknown Error!', message: property['message']})
                break;
            }
        }
        return errorsArray; 
    }
}