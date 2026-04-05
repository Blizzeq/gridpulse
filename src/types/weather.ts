export interface WeatherForecast {
  time: string[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  shortwave_radiation: number[];
  temperature_2m: number[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  hourly: WeatherForecast;
}
