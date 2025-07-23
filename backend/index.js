const express=require("express")
const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
const {UserModel,TodoModel} =require("./db")
const {z}=require("zod")
const bcrypt=require("bcrypt")
const JWT_SECRET="dontmesswithotherswarphonesorderitS"
const cors=require("cors")


mongoose.connect("mongodb+srv://harshitha0523:1RLAr8jhcmXZ6aoN@cluster0.8dcmhwd.mongodb.net/taskify")
const app=express()
app.use(express.json())
app.use(cors())

function auth(req,res,next){
    const token=req.headers.token
    const verify=jwt.verify(token,JWT_SECRET)
    if(verify){
        req.userId=verify.id
        next()
    }
    else{
        res.send("authentication failed")
    }
}


app.post('/signup',async (req,res)=>{
    const reqBody=z.object({
        email:z.string().email(),
        password:z.string().min(4).max(100)
    })
    const parseData=reqBody.safeParse(req.body)
    if(!parseData.success){
        console.log(parseData.error);
        res.send("invalid format")
        return
    }
    let error=false
    try{
        const email=req.body.email
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json("User already exists");
        }
        const password=req.body.password
        const hashpass=await bcrypt.hash(password,10)
        await UserModel.create({
            email:email,
            password:hashpass
        })
    }catch(e){
        res.json("user already exists")
        error=true;
    }
    if(!error){
        res.send("You are signedup")
    }
})


app.post('/signin',async (req,res)=>{
    const reqBody=z.object({
        email:z.string().email(),
        password:z.string().min(4).max(100)
    })
    const parseData=reqBody.safeParse(req.body)
    if(!parseData.success){
        res.send("invalid format")
        return
    }
    const email=req.body.email
    const password=req.body.password
    const user=await UserModel.findOne({
        email:email,
    })
    if(user){
        const hashpass=await bcrypt.compare(password,user.password)
        if(!hashpass){
            res.send("invalid passowrd")
            return
        }
        const token=jwt.sign({
            id:user._id.toString()
        },JWT_SECRET)
        res.json({
            token:token,
            userId: user._id.toString(),
            message:"you are signedIn"
        });
    }
    else{
        res.send("no user exists signup")
    }
})


app.use(auth)
app.post('/todo',async (req,res)=>{
    const todo=req.body.todo
    const userId=req.userId
    let error=false
    try{
        await TodoModel.create({
            title:todo,
            userId:userId
        })
    }catch(e){
        res.send("error")
        error=true
    }
    if(!error){
        res.send("added todd")
    }
})

app.get('/todo',async (req,res)=>{
    const userId=req.userId
    try{
        const todos=await TodoModel.find({userId:userId})
        res.send(todos)
    }catch(e){
        res.send("fetching failed")
    }
})


app.delete('/todo',async(req,res)=>{
    const userId=req.userId
    const title=req.body.title
    try{
        const todos=await TodoModel.deleteOne({
            userId:userId,
            title:title,
        })
        res.send("deleted from todos")
    }catch(e){
        res.send("there is an error in doing this")
    }
})

app.listen(3000)