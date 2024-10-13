const express=require('express');
const app=express();

app.get('/',(req,res)=>{
  res.write("Working just fine");
  res.end();
})
app.listen(8000)