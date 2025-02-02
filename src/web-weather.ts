import { AirQuality, AirQualitySensor, ScryptedDeviceBase, TemperatureUnit, Thermometer } from '@scrypted/sdk';
import { Constants } from './constants';

class WebWeather extends ScryptedDeviceBase implements AirQualitySensor, Thermometer {

    lastUpdatedAt: number
    
    airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${Constants.WEATHER_LAT}&lon=${Constants.WEATHER_LONG}&appid=${Constants.WEATHER_API_KEY}`
    weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${Constants.WEATHER_LAT}&lon=${Constants.WEATHER_LONG}&appid=${Constants.WEATHER_API_KEY}&units=imperial`

    aqiMap: AirQuality[] = [
        AirQuality.Unknown,
        AirQuality.Excellent,
        AirQuality.Good,
        AirQuality.Fair,
        AirQuality.Inferior,
        AirQuality.Poor
    ]

    constructor(nativeId?: string) {
        super(nativeId);
        this.airQuality = AirQuality.Unknown;
        this.lastUpdatedAt = Date.now();
        this.temperature = undefined;
        this.temperatureUnit = TemperatureUnit.F;
    }

    async setTemperatureUnit(temperatureUnit: TemperatureUnit): Promise<void> {
        this.temperatureUnit = temperatureUnit
    }

    getTemperature(): number | undefined {
        if (Date.now() - this.lastUpdatedAt < 300000) {
            this.refreshData();
        }
        return this.temperature
    }

    getAirQuality(): AirQuality | undefined {
        if (Date.now() - this.lastUpdatedAt < 300000) {
            this.refreshData();
        }
        return this.airQuality
    }

    async refreshData(): Promise<any> {
        this.lastUpdatedAt = Date.now()
        this.refreshTemp()
        this.refreshAirQuality()
    }

    async refreshTemp(): Promise<any> {
        try {
            const weatherResponse = await fetch(this.weatherUrl);
            const weatherData = await weatherResponse.json();
            this.temperature = weatherData.main.temp;
        } catch (error) {
            this.console.log(`Error refreshing temperature: ${error}`)
        }
    }

    async refreshAirQuality(): Promise<any> {
        try {
            const airQualityResponse = await fetch(this.airQualityUrl);
            const airQualityData = await airQualityResponse.json();
            this.airQuality = this.mapAirQuality(airQualityData.list[0].main.aqi);
        } catch (error) {
            this.console.log(`Error refreshing air quality: ${error}`)
        }
    }

    mapAirQuality(aqiNumber: number): AirQuality {
        return this.aqiMap[aqiNumber] || AirQuality.Unknown
    }
}

export default WebWeather
