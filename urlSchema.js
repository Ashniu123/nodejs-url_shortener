var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var urlSchema=new Schema({
        short_url:String,
        original_url:String
    },{
        timestamps:true}
);

var urlmon=mongoose.model("url",urlSchema);

module.exports=urlmon;
