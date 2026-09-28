const express=require('express');const cors=require('cors');const WebSocket=require('ws');
const app=express();app.use(cors());app.use(express.json());
const TRADING_ENABLED=process.env.TRADING_ENABLED==="true";
const DERIV_TOKEN=process.env.DERIV_TOKEN||"";
let bal=null,conn=false,logs=[];
function log(m,t='info'){logs.unshift({msg:m,type:t,time:new Date().toISOString()});if(logs.length>100)logs.pop();}
function connect(){if(!DERIV_TOKEN){log('No token - signal only');return;}
const ws=new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=1089`);
ws.on('open',()=>ws.send(JSON.stringify({authorize:DERIV_TOKEN})));
ws.on('message',d=>{const j=JSON.parse(d);if(j.authorize){conn=true;log('Deriv Demo connected');ws.send(JSON.stringify({balance:1}));}if(j.balance){bal=j.balance.balance;log('Balance: '+bal);}if(j.error)log('Error: '+j.error.message,'sell');});
ws.on('close',()=>{conn=false;setTimeout(connect,5000);});}
connect();
setInterval(()=>{if(!TRADING_ENABLED){log('BLOCKED - kill switch OFF');return;}log('DEMO SIGNAL BUY BOOM1000 Risk $0.01 NO ORDER','buy');},8000);
app.get('/status',(req,res)=>res.json({online:true,trading_enabled:TRADING_ENABLED,deriv_connected:conn,balance:bal}));
app.get('/feed',(req,res)=>res.json(logs));
app.post('/emergency-stop',(req,res)=>{log('EMERGENCY STOP','sell');res.json({ok:true});});
app.listen(process.env.PORT||3000,()=>log('Server start'));
