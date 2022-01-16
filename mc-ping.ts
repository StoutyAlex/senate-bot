import webhook from 'webhook-discord'

const run = async () => {
    const hook = new webhook.Webhook('https://discord.com/api/webhooks/932075206678290472/ShbPfyKWeNDozw9QG1jt5ARBa4hDhPvXZWIgs5kM0DptQz351tvi8R1wKFUoqoofvBuB')
    
    const message = new webhook.MessageBuilder()
        .setName('Senate MC Status')
        .setColor('#FF4500')
        .setText('Server is stopping!')
        .setTitle('Server is being shutdown')
        .setDescription('start the server again with the `sheev minecraft start` command')
        
    try {
        await hook.send(message)
    } catch (error) {
        console.log(error)
    }
}

run()