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

### Custom settings

Find a set of custom settings in the `settings-custom.js` file.

- globalKit: `id` of the Smart Citizen kit, displayed as the blue button on the index view. The global kit displays all its available sensors by default.
- sensors: List of sensors to be displayed in the dashboard
  - id: ID of the desired kit
  - title: Custom title
  - description: Custom description
  - image: Custom image. The image file must be placed in the `asssets` folder to be displayed
  - buttonText: Custom text for the special action
  - buttonUrl: Custom url that points the special action
  - telegramChat: ID of the telegram chat to be displayed. Find it (or generate it) on [Comments.app](https://comments.app/manage)

### Footer

To edit the footer, change the HTML in `index.html`. Keep the structure as it is. Images/logos must be placed in the `asssets` folder to be displayed.

## CSS

The `style.css` file contains the global styles that are used by all instances of the dashboard. Some custom css rules can be found and modified in the `style-custom.css` file.