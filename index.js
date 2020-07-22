const express = require('express')
const path = require('path')
const https = require("https")
const fs = require("fs")
const download = require('download');
const ngrok = require('ngrok');

const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6ImllNTVxdjhqU0ktRjhYdkJDZklsVlEiLCJleHAiOjE1OTQ5ODAwNDcsImlhdCI6MTU5NDM3NTI0N30.eMfjoiiqv31jwlPcEz6xXnSGxfPPeqcaNurs-oRzULs'

let GlobalData = {}

app.get(`/api/2020ITlandia/recordingPage`,async (req, upRes, next) => {
    let data = []
        const options = {
            "method": "GET",
            "hostname": "api.zoom.us",
            "port": null,
            "path": `/v2/users/${req.query.userId}/recordings?trash_type=meeting_recordings&to=${req.query.to}&from=${req.query.from}&mc=false&page_size=300`,
            "headers": {
              "authorization": `Bearer ${token}`
            }
        }
    const reqHttps = https.request(options, (res) => {
        res.on("data", (chunk) => {
            data.push(chunk)
        });
        res.on("end", () => {
            let body = Buffer.concat(data)
            GlobalData = JSON.parse(body.toString())
            const donwload = fs.readFileSync(`${__dirname}/api/downloadedFiels/${req.query.userId}/download.json`, "utf8");
            const downloaded = fs.readFileSync(`${__dirname}/api/downloadedFiels/${req.query.userId}/downloaded.json`, "utf8");
            const objAssign = Object.assign(GlobalData, JSON.parse(donwload),JSON.parse(downloaded))
            upRes.status(200).json(objAssign)
        });
    });
    reqHttps.end()
})



io.on('connection', async(socket) => {
    console.log('a user connected');
    socket.on('clickDownload', async(payload) => {
        console.log('acc',payload.account) 
        const searchItem = GlobalData.meetings.find((item)=>item.id===+payload.id)
        
        socket.emit('clickDownload',"OK")
        
        fs.mkdirSync(`${__dirname}/api/downloadedFiels/${payload.account}/${searchItem.topic}`)

        fs.readFile(`${__dirname}/api/downloadedFiels/${payload.account}/download.json`, (err, data)=> {
            if(err)console.log(err);
            
            const json = JSON.parse(data);
            json.downloadFiels.push(searchItem.uuid);    
            fs.writeFile(`${__dirname}/api/downloadedFiels/${payload.account}/download.json`, JSON.stringify(json), (err)=>{
              if (err) throw err;
            })
        })
        
        const a = await Promise.all(searchItem.recording_files.map(async (item)=>
        {
            return download(`${item.download_url}?access_token=${token}`,`${__dirname}/api/downloadedFiels/${payload.account}/${searchItem.topic}`)
        }
            
        ))
        fs.readFile(`${__dirname}/api/downloadedFiels/${payload.account}/download.json`, (err, data)=> {
            if(err)console.log(err)
            const json = JSON.parse(data)
            json.downloadFiels = json.downloadFiels.filter((item)=>item!==searchItem.uuid)
            fs.writeFileSync(`${__dirname}/api/downloadedFiels/${payload.account}/download.json`, JSON.stringify(json), (err)=>{
              if (err) throw err
            })

            let ddf = fs.readFileSync(`${__dirname}/api/downloadedFiels/${payload.account}/downloaded.json`,err=>{if(err) console.log(err)})
            ddf = JSON.parse(ddf)
            ddf.downloadedFiels.push(searchItem.uuid);
            fs.writeFileSync(`${__dirname}/api/downloadedFiels/${payload.account}/downloaded.json`, JSON.stringify(ddf), (err)=>{
                if (err) throw err
            })
        })

    })
})

app.use(express.static(path.resolve(__dirname, 'client')))

app.get('/', (req, res)=>{
    res.sendFile(path.resolve(__dirname, 'client', 'index.html'))
})





http.listen(3000, () => {
    console.log('listening on *:3000');
})
