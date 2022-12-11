import express  from 'express'
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import dotenv from 'dotenv'
import twilio from 'twilio'


const app=express()

//to get .env file data here
dotenv.config()
const accountSid=process.env.TWILIO_ACCOUNT_SID;
const authToken=process.env.TWILIO_AUTH_TOKEN;
const client=new twilio(accountSid, authToken);

const myMobileNum=process.env.MY_MOBILE_NUMBER;
const url='https://www.amazon.in/Apple-AirPods-MagSafe-Charging-Case/dp/B09JR27TBV/ref=sr_1_5?keywords=airpods&qid=1670744415&sr=8-5'
const hour=3600000
const handle=setInterval(() => {
            SendMessage()
        }, hour);

async function SendMessage(){

    const response=await fetch(url)
    const body=await response.text()
    const $=cheerio.load(body)

        const obj={
            productName:''
            ,price:''
            ,link:url
        }
            const name=$('#productTitle').text().trim().split(' ')
            obj.productName=name[0]+' '+name[1]
            obj.price= $('span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span.a-offscreen').text().replace(/[₹,]/g,'').split('.')[0]

        if(obj.price===''){SendMessage()
            return}
        console.log('price',obj.price)
            if(+obj.price < 16000){
                client.messages
                    .create({
                        body: `Price for ${obj.productName} went down to ₹${+obj.price} buy it now \n ${obj.link}`,
                        from: '+19704401504', // From a valid Twilio number
                        to: myMobileNum, // Text this number
                    })
                    .then((message) => console.log(message));
                clearInterval(handle)
            }

}SendMessage()



app.listen(process.env.PORT||8000,()=>{
    console.log('server is working on port',process.env.PORT||8000);
})