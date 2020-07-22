'use strict'

document.addEventListener('DOMContentLoaded', function() {
    function preloader(){
        return '<div class="sk-rotating-plane"></div>'
    } 

    function setSecondDate(selectFirstDate){
        document.querySelector('.secondDate').removeAttribute('disabled');
        const copyDate = new Date(selectFirstDate)
        copyDate.setDate(copyDate.getDate()+29)
        const optionsSecond = {
            autoClose: true,
            format:'yyyy mm dd',
            maxDate: copyDate>new Date()?new Date():copyDate,
            minDate: selectFirstDate,
            defaultDate: copyDate,
            setDefaultDate:true,
            i18n:{
                months: [
                    'Январь',
                    'Февраль',
                    'Март',
                    'Апрель',
                    'Май',
                    'Июнь',
                    'Июль',
                    'Август',
                    'Сентябрь',
                    'Октябрь',
                    'Ноябрь',
                    'Декабрь'
                ],
                monthsShort: [
                    '01',
                    '02',
                    '03',
                    '04',
                    '05',
                    '06',
                    '07',
                    '08',
                    '09',
                    '10',
                    '11',
                    '12'
                ],
                weekdaysShort: [
                    'ВС',
                    'ПН',
                    'ВТ',
                    'СР',
                    'ЧТ',
                    'ПТ',
                    'СБ'
                ]    
            } 
        }
        return optionsSecond   
    }
    
    function renderMeeting(data){
        console.log(data)
        document.querySelector('.listMeetings').innerHTML = ''
        data.meetings.forEach((item)=>{
            const trueDownload = data.downloadFiels.find(itemDownload=>itemDownload===item.uuid)
            const trueDownloaded = data.downloadedFiels.find(itemDownloaded=>itemDownloaded===item.uuid)
            const oneMeetingDiv = document.createElement('div')
            oneMeetingDiv.classList.add('meeting')
    
            const topicContainer = document.createElement('div')
            
            const topic = document.createElement('p')
            topic.classList.add('topicMeeting')
            topic.innerText = item.topic;
    
            topicContainer.append(topic)
            
            const btnAndDate = document.createElement('div');
            btnAndDate.classList.add('btnAndDate')
    
            const date = document.createElement('p')
            date.classList.add('dateMeeting')
            date.innerText = item.start_time.replace('T',' ').replace('Z','')
    
            const downloadBtn = document.createElement('div')
            
            downloadBtn.classList.add('buttonDownload')
            downloadBtn.id = item.id
            downloadBtn.setAttribute('data-uuid', item.uuid)
            if(trueDownload){
                downloadBtn.classList.add('lds-facebook')
                downloadBtn.innerHTML = '<div></div><div></div><div></div>'
            }else if(trueDownloaded){
                downloadBtn.classList.add('dissable')
                downloadBtn.innerText = 'Скачан'
            }else{
                downloadBtn.classList.add('enable')
                downloadBtn.innerText = 'Скачать' 
                downloadBtn.addEventListener('click', (e)=>{
                    requestDownloadFiles(e.target.id,e.target);
                },{once:true})
            }
            
    
            const span = document.createElement('span');
            span.append(date)
    
            btnAndDate.append(span)
            btnAndDate.append(downloadBtn)
            
    
            oneMeetingDiv.append(topicContainer)
            oneMeetingDiv.append(btnAndDate)
            
            document.querySelector('.listMeetings').append(oneMeetingDiv)
        })  
    
    }
    
    function requestDownloadFiles(uuid,target){
        socket.emit('clickDownload',{id:uuid,account:elems[0].value})
        socket.on('clickDownload', (msg)=>{
            console.log(msg)
            if(msg==='OK'){
                target.classList.remove('enable')
                target.classList.add('lds-facebook')
                target.innerHTML = '<div></div><div></div><div></div>'
            }
        })
    }
    
    async function request (url, method = 'GET', data = null) {
        try {
            const headers = {}
            
            let body
    
            if(data){
                headers['Content-Type'] = 'application/json'
            }
    
            const response = await fetch(url,{
                method,
                headers,
                body
            })
            return response.json()
        } catch (error) {
            console.log(error.message)
        }
    }    
    const optionsFirst = {
        autoClose: true,
        format:'yyyy mm dd',
        maxDate: new Date(),
        minDate: new Date('2020-04-01'),
        onSelect: (selectDate)=>{
            instancesSecond = M.Datepicker.init(secondPicker, setSecondDate(selectDate));
        },
        i18n:{
            months: [
                'Январь',
                'Февраль',
                'Март',
                'Апрель',
                'Май',
                'Июнь',
                'Июль',
                'Август',
                'Сентябрь',
                'Октябрь',
                'Ноябрь',
                'Декабрь'
            ],
            monthsShort: [
                '01',
                '02',
                '03',
                '04',
                '05',
                '06',
                '07',
                '08',
                '09',
                '10',
                '11',
                '12'
            ],
            weekdaysShort: [
                'ВС',
                'ПН',
                'ВТ',
                'СР',
                'ЧТ',
                'ПТ',
                'СБ'
            ]    
        }
    }

    const secondPicker = document.querySelectorAll('.secondDate');
    let instancesSecond = null

    const firstPicker = document.querySelectorAll('.firstDate');
    let instancesFirst = M.Datepicker.init(firstPicker, optionsFirst);

    const elems = document.querySelectorAll('select');
    let selectIntatnce = M.FormSelect.init(elems);

    

    document.querySelector('#getData').addEventListener('click', async (e)=>{
        if(secondPicker[0].value || firstPicker[0].value){
            document.querySelector('.listMeetings').innerHTML = ''
            document.querySelector('.listMeetings').classList.add('sk-rotating-plane')
            document.querySelector('.listMeetings').classList.remove('listMeetings')
            const data = await request(`/api/2020ITlandia/recordingPage?userId=${elems[0].value}&from=${instancesFirst[0].date.toISOString()}&to=${instancesSecond[0].date.toISOString()}`)
            document.querySelector('.sk-rotating-plane').classList.add('listMeetings')
            document.querySelector('.sk-rotating-plane').classList.remove('sk-rotating-plane')
            renderMeeting(data)
        }
    })
})
