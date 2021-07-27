const socket=io()

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//options
const {username,room}=Qs.parse(location.search,{ ignoreQueryPrefix:true})

const autoScroll=()=>{
    //new message element
    const $newMessage=$messages.lastElementChild

    //height of the new message
    const newMessagStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessagStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin

    //vissible height
    const vissibleHeight=$messages.offsetHeight

    //height of message container
    const containerHeight=$messages.scrollHeight

    //how far have i scrolled
    const scrollOffset=$messages.scrollTop + vissibleHeight

    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight

    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html =Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})


document.querySelector('#message-form').addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    //const message=document.querySelector('message').value
    const message=e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('message delivered')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    
    if(!navigator.geolocation){
        return alert('geolocation is not supported on your browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            console.log('location shared')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }

})


// socket.on('countUpdated',(count)=>{
//     console.log('the count has been updated',count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })