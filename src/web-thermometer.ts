import { ScryptedDeviceBase, TemperatureUnit, Thermometer } from '@scrypted/sdk';

class WebThermometer extends ScryptedDeviceBase implements Thermometer {
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

export default WebThermometer
