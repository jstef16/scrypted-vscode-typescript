// https://developer.scrypted.app/#getting-started
// package.json contains the metadata (name, interfaces) about this device
// under the "scrypted" key.
import { DeviceProvider, Thermometer, ScryptedDeviceBase, TemperatureUnit, ScryptedDeviceType, ScryptedInterface, ScryptedNativeId, sdk } from '@scrypted/sdk';

class OutdoorThermometer extends ScryptedDeviceBase implements Thermometer {
    constructor(nativeId?: string) {
        super(nativeId);
        this.temperature = 10;
        this.temperatureUnit = TemperatureUnit.F;
    }
    async setTemperatureUnit(temperatureUnit: TemperatureUnit): Promise<void> {
        this.temperatureUnit = temperatureUnit
    }
    getTemperature(): number | undefined {
        return this.temperature
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
                    nativeId: 'outdoorThermometer',
                    name: 'Outdoor Thermometer',
                    type: ScryptedDeviceType.Sensor,
                    interfaces: [
                        ScryptedInterface.Thermometer
                    ]
                }
            ]
        });
    }

    async getDevice(nativeId: string) {
        return new OutdoorThermometer(nativeId);
    }

    releaseDevice(id: string, nativeId: ScryptedNativeId): Promise<void> {
        throw new Error('Release device method not implemented.');
    }
}

export default OutdoorThermometer;
