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

        this.crcMap.set(0, '8fff')
        this.crcMap.set(1, '5cb8')
        this.crcMap.set(2, '2970')
        this.crcMap.set(5, '31b7')
        this.crcMap.set(10, 'f36e')
        this.crcMap.set(12, '9d21')
        this.crcMap.set(15, '4d26')
        this.crcMap.set(20, '56cd')
        this.crcMap.set(25, '329b')
        this.crcMap.set(30, '2a5c')
        this.crcMap.set(35, '924c')
        this.crcMap.set(38, '2c04')
        this.crcMap.set(40, '3d9a')
        this.crcMap.set(45, '83d2')
        this.crcMap.set(50, 'f536')
        this.crcMap.set(55, '4b7e')
        this.crcMap.set(60, 'e4a8')
        this.crcMap.set(63, '9160')
        this.crcMap.set(65, '8c4e')
        this.crcMap.set(70, '9489')
        this.crcMap.set(75, 'f0df')
        this.crcMap.set(80, 'eb34')
        this.crcMap.set(85, '557c')
        this.crcMap.set(88, '312a')
        this.crcMap.set(90, '97a5')
        this.crcMap.set(94, 'faaa')
        this.crcMap.set(95, '29ed')
        this.crcMap.set(96, '3772')
        this.crcMap.set(97, 'e435')
        this.crcMap.set(98, '91fd')
        this.crcMap.set(99, '42ba')
        this.crcMap.set(100, '5a7d')
    }

    ipAddr: string | undefined;
    port = 42;
    private socket: dgram.Socket;

    stateIndicator = 29;
    getState = '0a00898f1d0d000001000000000000000000';

    crcMap: Map<number, string> = new Map();

    getUsablePercentage(percentage: number): number {
        percentage = Math.floor(percentage)
        let crc = this.crcMap.get(percentage)

        while (crc === undefined) {
            percentage++

            this.console.log(`Finding usable percentage for ${percentage}`)
            if (percentage < 0) {
                percentage = 0
            } else if (percentage > 100) {
                percentage = 100
            }

            crc = this.crcMap.get(percentage)
        }

        return percentage
    }

    buildSetString(percentage: number): string {
        let start = '0a00'
        let middle = '1a0d00000100'
        let end = '00000000000000'

        let usablePercentage = this.getUsablePercentage(percentage)
        let crc = this.crcMap.get(usablePercentage)

        let percentageAsHex = usablePercentage.toString(16).padStart(2, '0')
        this.console.log(percentageAsHex)
        return `${start}${crc}${middle}${percentageAsHex}${end}`
    }

    async setBrightness(brightness: number): Promise<void> {
        try {
            this.sendUdpRequest(this.buildSetString(brightness))
        } catch (_e) {
            this.console.log(`Set brightness error: ${_e}`);
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
            console.log(`UDP error: ${err}`);
            console.log(`UDP bytes: ${bytes}`);
            // this.console.log(`Port used by UDP client: ${this.socket.address().port}`);
            if (isInitialRequest) {
                this.console.log(`Subscribing socket to messages at ${this.ipAddr}:${this.socket.address().port}`);
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

                let usablePercentage = this.getUsablePercentage(percentage)
                this.console.log(`Current percent open: ${percentage}% Current usable percentage: ${usablePercentage}% Brightness: ${this.brightness}`)

                if (this.brightness != usablePercentage) {
                    this.brightness = usablePercentage
                    this.console.log(`New brightness is ${this.brightness}`)
                }
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
