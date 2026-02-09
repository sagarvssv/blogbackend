import cron from 'cron';
import e from 'express';
import https from 'https';



const job = new cron.CronJob('*/12 * * * *',  async () => {
    https.get(process.env.API_URL,(res)=>{
        if(res.statusCode === 200){
            console.log('API is up and running');
        }else{
            console.log('API is down');
        }
    })
    .on('error', (error) => {
        console.error('API request error:', error);
    });
})

export default job