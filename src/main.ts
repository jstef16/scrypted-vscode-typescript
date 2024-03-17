import dgram = require('dgram');
// https://developer.scrypted.app/#getting-started
// package.json contains the metadata (name, interfaces) about this device
// under the "scrypted" key.
import { Entry, EntrySensor, ScryptedDeviceBase } from '@scrypted/sdk';

console.log('Hello World. This will create a virtual powershades window covering.');
// See "interfaces"  in package.json to add support for more capabilities

class PowerShade extends ScryptedDeviceBase implements Entry, EntrySensor {
    constructor(nativeId?: string) {
        super(nativeId);
        this.on = this.on || false;
    }
    
    client = dgram.createSocket('udp4');
    ipAddr = '192.168.1.80';
    port = 42;
    allTheWayOpen = '0a 00 5a 7d 1a 0d 00 00 01 00 0a 00 00 00 00 00 00 00';
    halfOpen = '0a 00 f5 36 1a 0e 00 00 01 00 0c 00 00 00 00 00 00 00';
    allTheWayClosed = '0a 00 8f ff 1a 0d 00 00 01 00 0a 00 00 00 00 00 00 00';

    async closeEntry() {

        this.sendUdpRequest(this.halfOpen);
        
        // return new Promise((resolve, reject), => {});
        throw new Error('Close method not implemented.');
    }

    async openEntry() {
        
        this.sendUdpRequest(this.allTheWayOpen);
        throw new Error('Open method not implemented.');
    }

    sendUdpRequest(message: string){
        
        this.client.send(message, this.port, this.ipAddr, (err, bytes) =>{
            console.log('UDP error: %s', err);
            console.log('UDP bytes: %s', bytes);
            this.client.close();
        });
    }

    // async turnOff() {
    //     this.console.log('turnOff was called!');
    //     this.on = false;
    // }
    // async turnOn() {
    //     // set a breakpoint here.
    //     this.console.log('turnOn was called!');

    //     this.console.log("Let's pretend to perform a web request on an API that would turn on a light.");
    //     const response = await fetch('http://jsonip.com');
    //     const json = await response.json();
    //     this.console.log(`my ip: ${json.ip}`);

    //     this.on = true;
    // }
}

export default PowerShade;
