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
const myMobileNum=process.env.MY_MOBILE_NUMBER;
const client=new twilio(accountSid, authToken);

const amazon='https://www.amazon.in/Apple-AirPods-MagSafe-Charging-Case/dp/B09JR27TBV/ref=sr_1_5?keywords=airpods&qid=1670744415&sr=8-5'

const flipkart='https://www.flipkart.com/apple-airpods-pro-magsafe-charging-case-bluetooth-headset/p/itm0847811966368?pid=ACCG7XG5ZQ47ZHFR&lid=LSTACCG7XG5ZQ47ZHFRGTXJL1&marketplace=FLIPKART&q=airpods+pro&store=0pm%2Ffcn&srno=s_1_1&otracker=search&otracker1=search&fm=Search&iid=be5647f3-3df1-4097-9b50-c33339aef983.ACCG7XG5ZQ47ZHFR.SEARCH&ppt=sp&ppn=sp&ssid=yyygnd24g00000001670755855354&qH=34bcf44f67ad7e7f'

//! here interval is working is per-hour
const hour=3600000
const handle=setInterval(() => {
            SendMessage()
            scrapeFlipkart()
        }, hour);



// ! this function is for amazon scraping
async function SendMessage(){

    const response=await fetch(amazon)
    const body=await response.text()
    const $=cheerio.load(body)

    const obj={productName:'',price:'',link:amazon}
       
            const name=$('#productTitle').text().trim().split(' ');
            obj.productName=`${name[0]} ${name[1]} ${name[2]}`;

            obj.price= $('span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span.a-offscreen').text().replace(/[₹,]/g,'').split('.')[0]

        if(obj.price===''){SendMessage()
            return}
        console.log('Amazon-price:',+obj.price)

        if(+obj.price < 16000){
            sendSMS(obj.productName,obj.price,obj.link)
            }

}
SendMessage();

//! this function is for sending sms to mobile no.
function sendSMS(productName,price,link){
 client.messages.create({
                        body: `\n🎉 Price for ${productName} went down to ₹${+price} buy it now \n ${link}`,
                        from: '+19704401504', // From a valid Twilio number
                        to: myMobileNum, // Text this number
                    })
                    .then((message) => console.log(message));
                clearInterval(handle);
}

//! This function is for flipkart scraping
async function scrapeFlipkart(){
    const response= await fetch(flipkart);
    const body=await response.text();
    const $=cheerio.load(body);
    const obj={productName:'',price:'',link:amazon}

    obj.price=$('div.CEmiEU > div > div._30jeq3._16Jk6d').text().replace(/[₹,]/g, '');
    const Name=$(' div:nth-child(1) > h1 > span').text().split(' ')
        obj.productName=(`${Name[0]} ${Name[1]} ${Name[2]}`)

         if(obj.price===''){scrapeFlipkart()
            return}
        console.log('Flipkart-price:',+obj.price)

            if(+obj.price < 16000){
               sendSMS(obj.productName,obj.price,obj.link)
            }

}scrapeFlipkart()



app.listen(process.env.PORT||8000,()=>{
    console.log('server is working on port',process.env.PORT||8000);
})