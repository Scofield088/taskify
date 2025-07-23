const mongoose=require("mongoose")
const { type } = require("os")
const Schema=mongoose.Schema
const objectid=mongoose.ObjectId


const userschema=new Schema({
    email:{type:String,unique:true},
    password:String
})

const todoschema=new Schema({
    title:String,
    userId:objectid
})

const UserModel=mongoose.model('users',userschema)
const TodoModel=mongoose.model('todos',todoschema)
module.exports={
    UserModel:UserModel,
    TodoModel:TodoModel
}