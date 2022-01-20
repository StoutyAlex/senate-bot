import * as cdk from '@aws-cdk/core'
import * as s3Deploy from '@aws-cdk/aws-s3-deployment'
import * as s3 from '@aws-cdk/aws-s3'
import * as path from 'path'
import * as fs from 'fs';
import PropertiesReader from 'properties-reader'
import { SenateMCSecurityGroup } from './mc-server-security-group'

export interface SenateMCBundleProps {
    buildName: (name: string) => string
    rconPassword: string
    serverSecurityGroup: SenateMCSecurityGroup
    ftb: boolean
}

export class SenateMCBundle extends cdk.Construct {
    public bucket: s3.Bucket

    constructor(scope: cdk.Construct, id: string, props: SenateMCBundleProps) {
        super(scope, id)

        const { buildName, serverSecurityGroup, rconPassword, ftb } = props

        const serverFilesDir = ftb ? 'server-files-ftb' : 'server-files'
        const serverBundleDir = ftb ? 'server-bundle-ftb' : 'server-bundle'

        const serverBundlePath = path.join(__dirname, serverBundleDir)
        this.purgeBundleFolder(serverBundlePath)

        fs.copyFileSync(path.join(__dirname, serverFilesDir, 'minecraft.service'), path.join(__dirname, serverBundleDir, 'minecraft.service'))
                
        const properties = PropertiesReader(path.join(__dirname, serverFilesDir, 'server.properties'))

        // Set auto-generated server.properties settings
        properties.set('rcon.port', serverSecurityGroup.rconPort)
        properties.set('rcon.password', rconPassword)
        properties.set('query.port', serverSecurityGroup.mcPort)
        properties.set('server-port', serverSecurityGroup.mcPort)

        const newPropertieseFile: string[] = []

        properties.each((key, value) => {
            newPropertieseFile.push(`${key}=${value}\n`)
        })

        fs.writeFileSync(path.join(serverBundlePath, 'server.properties'), newPropertieseFile.join(''))
        
        this.bucket = new s3.Bucket(this, 'minecraft-bundle', {
            bucketName: buildName('bundle'),
            removalPolicy: cdk.RemovalPolicy.DESTROY
        })

        new s3Deploy.BucketDeployment(this, 'service-deploy', {
            sources: [s3Deploy.Source.asset(serverBundlePath)],
            destinationBucket: this.bucket,
        })
    }

    private purgeBundleFolder(bundlePath: string) {
        if (fs.existsSync(bundlePath)) {
            fs.rmdirSync(bundlePath, {
                recursive: true
            })
        }

        fs.mkdirSync(bundlePath)
    }
}