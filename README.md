# Smart Citizen Dashboard

An easily deployable dashboard to display data from [Smart Citizen](https://smartcitizen.me/) kits.

## Installation

1. Place all the files where you want to deploy the dashboard
2. Adapt `settings.js` to your needs
3. Visit `index.html` in a browser with an internet connection

## Customisation

### Settings

Find a set of settings in the `settings.js` file.

- title: Title of the page, displayed on the index
- filter: Used to filter the index. The type can be `tag`, `city`, `user`. The value must match the type. Use the [Smart Citizen platform](https://smartcitizen.me/kits/) as a reference.
- searchbar: `true` or `false`
- primarySensor: Used to display the primary status of the kit. Use [Kit blueprints](https://codepen.io/pral2a/full/WgQBvP) as a reference to find the desired sensor ID. The threshold value indiciates the range in which the sensor value is acceptable.
- sensors: list of sensors to be displayed in the detail page. The threshold value indiciates the range in which the sensor value is acceptable.
- indexView: Define which fields are displayed in the index view. Values can be `user`, `city`, `tags`, `id`. Is cancelled if the minimalistic option (see below) is set to `true`.
- Styles: Some styles you can play with to define the visual identity of the dashboard. These value are then injected into the CSS as variables.
- minimalistic: `true` or `false`. This defines whether the index view shows textual information or only color-based information.