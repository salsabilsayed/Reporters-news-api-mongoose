const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const reporterSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email!')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minLength:5
    },
    age:{
        type:Number,
        default:'30',
        validate(value){
            if(value < 0){
                throw new Error('Age must be a positive number!')
            }
        }
    },
    phone:{
        type:String,
        required:true,
        trim:true,
        validate(value){
            if(!validator.isMobilePhone(value ,['ar-EG'])){
                throw new Error('please enter a valid mobile number')
            }
        }
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    image:{
        type:Buffer,
        default:`https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg`
    }
},{timestamps:true});

// relation between reporter & news
reporterSchema.virtual('news',{
    ref:'News',
    localField:'_id',
    foreignField:'owner'
})

// hash password before saving
reporterSchema.pre('save', async function(next){
    const reporter = this

    if(reporter.isModified('password')){
        reporter.password = await bcrypt.hash(reporter.password,8)
    }
    next();
});

// login function
reporterSchema.statics.findByCredentials = async(email,password) => {
    const reporter = await Reporter.findOne({email:email});
    if(!reporter){
        throw new Error('Email not found,Please sign up!');
    }

    const isMatch = await bcrypt.compare(password,reporter.password)
    if(!isMatch){
        throw new Error('can not login,incorrect password')
    }

    return reporter;
}

// generating token
reporterSchema.methods.generateToken = async function(){
    const reporter = this
    const token = jwt.sign({_id:reporter._id.toString()},'news-application')
    reporter.tokens = reporter.tokens.concat({token});
    await reporter.save();
    return token;
}

// hide data
reporterSchema.methods.toJSON = function (){
   const reporter = this;
   const reporterObject = reporter.toObject();
   delete reporterObject.password;
   delete reporterObject.tokens;
   return reporterObject;
}

const Reporter = mongoose.model('Reporter', reporterSchema);

module.exports = Reporter;