const fs = require('fs');
let files = require("./files/files.json");

module.exports = class fileObject {
    constructor() {
      let fl = {};
      for(let element of files.files){
        fl[element.name] = {
          price: element.price,
          providerAddress: element.providerAddress
        }
      }
      this.data = fl;
    }

    getFile(name){
      if(name in this.data){
        return this.data[name];
      }else{
        return {
          price: "0",
          providerAddress: "0x0"
        }
      }
    }
}
