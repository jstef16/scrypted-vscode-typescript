// https://developer.scrypted.app/#getting-started
import dgram = require('dgram');
import { Entry, EntrySensor, ScryptedDeviceBase, DeviceProvider, ScryptedDeviceType, ScryptedInterface, sdk, ScryptedNativeId } from '@scrypted/sdk';

console.log('Hello World. This will create a virtual powershades window covering.');

class PowerShade extends ScryptedDeviceBase implements Entry, EntrySensor {
    constructor(nativeId?: string) {
        super(nativeId);
        this.on = this.on || false;
        this.ipAddr = this.info?.ip;
    }

    ipAddr: string | undefined;
    port = 42;
    allTheWayOpen = '0a005a7d1a0d000001006400000000000000';
    mostlyOpen = '0a00312a1a0d000001005800000000000000';
    allTheWayClosed = '0a008fff1a0d000001000000000000000000';

    async closeEntry() {
        try {
            this.sendUdpRequest(this.allTheWayClosed);
        } catch (_e) {
            this.console.log(_e);
        }
        this.entryOpen = false
    }

    async openEntry() {
        try {
            this.sendUdpRequest(this.allTheWayOpen);
        } catch (_e) {
            this.console.log(_e);
        }
        this.entryOpen = true
    }

    sendUdpRequest(message: string) {

        let client = dgram.createSocket('udp4');
        client.send(Buffer.from(message, 'hex'), this.port, this.ipAddr, (err, bytes) => {
            console.log('UDP error: %s', err);
            console.log('UDP bytes: %s', bytes);
            client.close();
        });
    }
}

class PowerShadeProvider extends ScryptedDeviceBase implements DeviceProvider {
    constructor(nativeId?: string) {
        super(nativeId);

        this.prepareDevices();
    }

    async prepareDevices() {
        await sdk.deviceManager.onDevicesChanged({
            devices: [
                {
                    nativeId: 'livingRoomShade',
                    name: 'Living Room Shade',
                    type: ScryptedDeviceType.WindowCovering,
                    interfaces: [
                        ScryptedInterface.Entry,
                        ScryptedInterface.EntrySensor
                    ],
                    info: {
                        ip: '192.168.1.80'
                    }
                },
                {
                    nativeId: 'bedroomShade',
                    name: 'Bedroom Shade',
                    type: ScryptedDeviceType.WindowCovering,
                    interfaces: [
                        ScryptedInterface.Entry,
                        ScryptedInterface.EntrySensor
                    ],
                    info: {
                        ip: '192.168.1.71'
                    }
                },
                {
                    nativeId: 'loftShade',
                    name: 'Loft Shade',
                    type: ScryptedDeviceType.WindowCovering,
                    interfaces: [
                        ScryptedInterface.Entry,
                        ScryptedInterface.EntrySensor
                    ],
                    info: {
                        ip: '192.168.1.69'
                    }
                },
                {
                    nativeId: 'officeShade',
                    name: 'Office Shade',
                    type: ScryptedDeviceType.WindowCovering,
                    interfaces: [
                        ScryptedInterface.Entry,
                        ScryptedInterface.EntrySensor
                    ],
                    info: {
                        ip: '192.168.1.66'
                    }
                }
            ]
        });
    }

    async getDevice(nativeId: string) {
        return new PowerShade(nativeId);
    }

    releaseDevice(id: string, nativeId: ScryptedNativeId): Promise<void> {
        throw new Error('Release device method not implemented.');
    }
}

export default PowerShadeProvider;
