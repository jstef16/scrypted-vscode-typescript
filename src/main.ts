// https://developer.scrypted.app/#getting-started
import dgram = require('dgram');
import { Brightness, ScryptedDeviceBase, DeviceProvider, Refresh, ScryptedDeviceType, ScryptedInterface, sdk, ScryptedNativeId } from '@scrypted/sdk';

console.log('This will create a virtual powershades window covering.');

class PowerShade extends ScryptedDeviceBase implements Brightness, Refresh {
    constructor(nativeId?: string) {
        super(nativeId);
        this.on = this.on || false;
        this.ipAddr = this.info?.ip;
        this.socket = dgram.createSocket('udp4');
    }

    ipAddr: string | undefined;
    port = 42;
    private socket: dgram.Socket;

    stateIndicator = 29;
    getState = '0a00898f1d0d000001000000000000000000';

    buildSetString(percentage: number): string {
        let start = '0a00'
        let middle = '1a0d00000100'
        let end = '00000000000000'

        let crcMap: Map<number, string> = new Map();

        crcMap.set(0, '8fff')
        crcMap.set(10, 'f36e')
        crcMap.set(12, '9d21')
        crcMap.set(25, '329b')
        crcMap.set(38, '2c04')
        crcMap.set(50, 'f536')
        crcMap.set(63, '9160')
        crcMap.set(75, 'f0df')
        crcMap.set(88, '312a')
        crcMap.set(94, 'faaa')
        crcMap.set(95, '29ed')
        crcMap.set(96, '3772')
        crcMap.set(97, 'e435')
        crcMap.set(98, '91fd')
        crcMap.set(99, '42ba')
        crcMap.set(100, '5a7d')

        percentage = Math.floor(percentage)
        let crc = crcMap.get(percentage)

        while (crc === undefined) {
            percentage++

            this.console.log('Finding CRC for %d', percentage)
            if (percentage < 0) {
                percentage = 0
            } else if (percentage > 100) {
                percentage = 100
            }

            crc = crcMap.get(percentage)
        }

        let percentageAsHex = percentage.toString(16).padStart(2, '0')
        this.console.log(percentageAsHex)
        return `${start}${crc}${middle}${percentageAsHex}${end}`
    }

    async setBrightness(brightness: number): Promise<void> {
        try {
            this.sendUdpRequest(this.buildSetString(brightness))
        } catch (_e) {
            this.console.log("Set brightness error: %s", _e);
        }
    }

    sendUdpRequest(message: string) {

        let isInitialRequest = false;
        try {
            this.socket.address();
        } catch (_e) {
            this.console.log("Socket is not bound. Will subscribe to messages after request");
            isInitialRequest = true;
        }

        this.socket.send(Buffer.from(message, 'hex'), this.port, this.ipAddr, (err, bytes) => {
            console.log('UDP error: %s', err);
            console.log('UDP bytes: %s', bytes);
            // this.console.log('Port used by UDP client: ', this.socket.address().port);
            if (isInitialRequest) {
                this.console.log("Subscribing socket to messages at %s:%n", this.ipAddr, this.socket.address().port);
                this.subscribeUdpSocket(this.ipAddr, this.socket.address().port);
            }
        });
    }

    async getRefreshFrequency(): Promise<number> {
        this.console.log('Returned refresh frequency');
        return 15;
    }

    async refresh(refreshInterface: string, userInitiated: boolean): Promise<void> {
        try {
            this.sendUdpRequest(this.getState)
        } catch (_e) {
            this.console.log(_e);
        }
    }

    subscribeUdpSocket(ipAddr: string | undefined, port: number | undefined) {

        this.console.log('Subscribing UDP socket to requests')

        // Handle incoming messages
        this.socket.on('message', (msg, rinfo) => {
            // console.log(`UDP socket received: ${msg.toString('hex')} from ${rinfo.address}:${rinfo.port}`);

            if (msg[4] == this.stateIndicator) {
                let percentage = msg[8];
                this.console.log(`Current percent open: ${percentage}%`)
                this.brightness = percentage
            }
        });

        // Handle errors
        this.socket.on('error', (err) => {
            console.error('UDP socket error:', err);
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
                        ScryptedInterface.Brightness,
                        ScryptedInterface.Refresh
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
                        ScryptedInterface.Brightness,
                        ScryptedInterface.Refresh
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
                        ScryptedInterface.Brightness,
                        ScryptedInterface.Refresh
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
                        ScryptedInterface.Brightness,
                        ScryptedInterface.Refresh
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
