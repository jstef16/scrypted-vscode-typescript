// https://developer.scrypted.app/#getting-started
import { DeviceProvider, ScryptedDeviceBase, ScryptedDeviceType, ScryptedInterface, ScryptedNativeId, sdk } from '@scrypted/sdk';
import PowerShade from './powershade';
import WebThermometer from './web-thermometer';

class CustomProvider extends ScryptedDeviceBase implements DeviceProvider {
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
                },
                {
                    nativeId: 'webThermometer',
                    name: 'Web Thermometer',
                    type: ScryptedDeviceType.Sensor,
                    interfaces: [
                        ScryptedInterface.Thermometer
                    ]
                }
            ]
        });
    }

    async getDevice(nativeId: string) {
        if(nativeId.endsWith("Shade"))
            return new PowerShade(nativeId);
        
        return new WebThermometer(nativeId);
    }

    releaseDevice(id: string, nativeId: ScryptedNativeId): Promise<void> {
        throw new Error('Release device method not implemented.');
    }
}

export default CustomProvider;
