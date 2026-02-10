// phone number service for otp sending

const twillo = require('twilio')

//twillo credentials form env
const accountSid = process.env.TWILLO_ACCOUNT_SID;
const authToken = process.env.TWILLO_AUTH_TOKEN;
const serviceSid = process.env.TWILLO_SERVICE_SID;

const client = twillo(accountSid,authToken);

//send otp to phone number
const sendOtpToPhoneNumber = async(phoneNumber) => {
    try {
        console.log('sending otp to this number',phoneNumber);
        if(!phoneNumber){
            throw new Error('Phone Number is required')
        }

        const response = await client.verify.v2.services(serviceSid).verifications.create({
            to : phoneNumber,
            channel : 'sms'
        })
        console.log('This is my OTP response',response)
        return response;
    } catch (error) {
        console.error(error)
        throw new Error('Failed to send OTP')
    }
}

// now varify the otp 

const varifyOtp = async(phoneNumber,otp) => {
    try {
        console.log("this is my otp : ",otp)        
        console.log("this is my Phone Number : ",phoneNumber)        

        const response = await client.verify.v2.services(serviceSid).verificationChecks.create({
            to : phoneNumber,
            code : otp
        })
        console.log('This is my OTP response',response)
        return response;
    } catch (error) {
        console.error(error)
        throw new Error('OTP varification failed :(')
    }
}


module.exports = {
    sendOtpToPhoneNumber,
    varifyOtp
}
 