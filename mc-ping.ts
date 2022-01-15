import * as mcs from 'minecraft-server-util'
import AWS from 'aws-sdk'
import { DescribeInstancesRequest } from 'aws-sdk/clients/ec2'

mcs.status('54.216.225.131', 25565).then(console.log)

const client = new mcs.RCON()
const ec2 = new AWS.EC2({ region: 'eu-west-1' })

const run = async () => {

    let saveRequest: number
    let stopRequest: number

    client.on('message', async (data) => {
        console.log('Data', data)
        console.log('My Request number', saveRequest)
    })

    await client.connect('54.216.225.131', 25575)
    await client.login('IUuhQtpOIHfTfTplTQhDWeCQkGLKOarU')
    saveRequest = await client.run('save-all')
}

run()