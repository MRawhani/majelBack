const AddressSchema = require("./models/AddressSchema");

class FakeDb {
  constructor() {
    this.rentals = [
      {
        
        city: "صنعاء",
        street: "سواد حنش",
        
      },
      {
        
        city: "صنعاء",
        street: "المصباحي",
        
      },
      {
        
        city: "صنعاء",
        street: "حده",
        
      },
      {
        
        city: "صنعاء",
        street: "الحصبة",
        
      },
      {
        
        city: "صنعاء",
        street: "التحرير",
        
      },
     
    ];
    this.users = [
      {
        username: 'Mo',
        email: 'momo@gmail.com',
        password: '1234'
      },
      {
        username: 'Mo2',
        email: 'momo2@gmail.com',
        password: '1234'
      }
    ]
  }
  async cleanDb() {
    await AddressSchema.deleteMany({});
  
  }

  pushDataToDb() {
    AddressSchema.insertMany(this.rentals);
  }
 
  async seedDb() {
    console.log('dcfvbg');
    
   await this.cleanDb();
    this.pushDataToDb();
  }
}

module.exports = FakeDb;
