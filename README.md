# Data Board Frontend

This is the frontend for the Data Board project. It is a React application written in TypeScript that uses the [Data Board Backend](https://github.com/paulscherrerinstitute/data_board_backend).

---

## 🖥️ Usage

### Search for Channels

You can search for channels by using the sidebar to the left. This sidebar can be expanded either by using the buttons at the top left of the sidebar or by dragging the edge of the sidebar to the desired position for more granular control.

The sidebar searches for all channels matching the search string, using [Datahub](https://github.com/paulscherrerinstitute/datahub), which in turn accesses the [Daqbuf API V4](https://data-api.psi.ch/api/4/docs/index.html).

The initial width of the sidebar can be configured in the [General Settings](#general).

The filters are dynamically selected based on the data the search returned. If no filters are selected, all values are shown.

### Add Channels to Plot

To add a channel to a plot, you can either:

1. Mark it (and some more) as selected using the checkbox in the sidebar, and drag any one of those to the target destination.

2. Directly drag it to the target destination. The channel becomes selected for the duration of the drag and gets unselected right after. This way, other selected channels are also dragged.

3. Drag a channel from the legend of a plot containing it to the destination. The source plot will keep its channel.

The destination can be one of the following:

1. An existing plot; this will simply add the channel(s) to the plot.

2. The button at the bottom of the plots, containing a plus. This will create a new plot with the dragged channel(s).

3. If your browser supports it, you can also drag the channel outside of the browser tab and, e.g., drop it into a notepad app.

    > _Hint_: You can also do the inverse if your browser supports it (add channels by dragging from outside the browser); the DragEvent utilises simple text data.

### Set Query Parameters

The query parameters are defined for all plots and can be set in the topbar.

- **Timerange:** The timerange can be defined using local time. If your browser's date/time picker doesn't support seconds, you can click in the text field and set the seconds there.

    > ⚠️ **Important:** The time displayed in the plots will also be in **local time**, _not_ UTC!

    - **Quick Select:** You can also utilise quick select to get an absolute timestamp for relative time. If you apply the query parameters, relative times will be recalculated, if quick select is active.

- **Raw when sparse:** This toggle defines if the curves should be drawn using raw data if there are not enough points for binned data. This simply removes unnecessary min/max curves and is highly recommended to stay activated.

- **Remove empty bins:** Traditionally, if a bin has no data in it, the bin will have no min or max but a value, and this is taken from the last bin that has data. This can be seen as duplicated (and undesirable) data points, but it could also be argued to be logical, as some may wish to assume that the data remains as it was previously if no event indicating otherwise has occurred. This toggle specifies whether such "duplicated" data points should be displayed or filtered out (removed).

- **Auto Apply:** This can be used if you have relative timestamps (using Quick Select) or simply want to refetch the data from time to time. It displays a status bar until the next press and then simulates a press of the `APPLY`-button.

To apply query parameters, you have to click the `APPLY`-button. Or, activating auto-apply also does the job.

### Arrange Plot Dashboard

- New plots can be created using the button at the bottom of the plots, with the plus on it.

- You can delete plots by clicking the round icon with the "x" on them at the very top right of any plot.

- Plots can be arranged using drag and drop, but make sure not to drag the canvas or legend. It is easiest to drag the bottom of the plot, for example, by the X-axis title.

- Plots can be resized within the plotting area by dragging one of the marked corners of the plot.

- You can also [import](#import-dashboard) or [export](#export-dashboard) dashboards.

### Settings

The settings can be reached by using the settings icon at the top left in the sidebar. In there, various settings can be defined.

- Settings are available for preview in a sample plot at the bottom of the general settings tab.

- To reset to default settings, use the button at the bottom.

- You can also [import](#import-settings) or [export](#export-settings) those settings.

- The settings are only applied to the whole application once the settings tab is closed. This may take a bit, since all of the components might need to be re-rendered

#### General

The general section contains settings that affect all plots.

- **Initial Sidebar State:** Decides the width of the sidebar upon loading the site

- **Theme:** The theme. _Will_ take a bit to be applied upon closing the settings, since this forces all components to be re-rendered.

- **Watermark Opacity:** The opacity of the watermark in the plot. Use 0 for no watermark.

- **Plot Background Color:** Affects all plots even existing ones. This is overwritten when a theme is selected but can be changed back manually.
- **X-Axis / Y-Axis Grid Color:** These two settings behave the same way as plot background color.

- **Use WebGL:** Decides whether or not the graphics card should be used to render curves. Highly recommended, it allows for somewhat performant rendering of even bigger curves.

- **Use Virtual WebGL Contexts:** Since the number of WebGL contexts (proportional to the number of plots) is limited on most browsers, they might break if too many plots are drawn. As a workaround, this setting can be enabled to make all plots share one WebGL context.

    > ⚠️ **Warning:** This setting is an experimental _workaround_ and may break the plotting.

- **Initial Widget Height / Width:** Initial dimensions new plots take when they are created. Does not affect the very first plot.

#### Plot Defaults

The plot default section contains settings which are applied to new plots upon creation and then saved for those plots. Changing anything here will **NOT** have an effect on existing plots at all.

- **Curve Color Scheme:** The scheme with which new curves are colored.
- **Y-Axis Scaling:** Choose between logarithmic and linear scaling.
- **Curve Shape:** Defines how the connections between data points are drawn. Based on [Plotly's CurveShape](https://plotly.com/javascript/line-charts/#line-shape-options-for-interpolation).

- **Curve Mode:** Defines how data points are drawn and if connections are made between the points.

### Plot Actions

The following are actions that can be taken for each plot individually.

#### Modebar buttons

The modebar buttons are buttons that define some quick actions you can perform on any plot and are located on the top right of the respective canvas. The following options are available:

- **Download data as CSV/JSON:** Downloads the data, as received from the archiver, in the selected format.

- **Download Picture as PNG:** Downloads a picture of the plot and legend as PNG. The resolution is 4x the display resolution; therefore, the generating process may take a second or two.

    > ⚠️ **Warning**: If the legend is scrollable due to its size, only the visible area will be captured. Zooming out may help capture more of the legend.

- **Zoom In/ Zoom Out, Autoscale, Reset Axes:** These are default Plotly buttons.

- **Open Plot Settings:** The settings gear on the right of the modebar opens [plot-specific settings](#plot-specific-settings).

#### Plot-Specific Settings

In these settings, you can define properties that only affect the current plot, and are saved to the dashboard.

- **Plot Title:** The title of the plot, as displayed
- **Curve Settings:** Settings for single curves; every defined curve is mapped out and can be configured by itself.

    - **Color:** This curve's color

    - **Name, Backend, Datatype:** Attributes of this curve, as received from the Archiver.

    - **Label:** The label displayed for this curve.

    - **Axis:** On which axis this curve is drawn.

        > ⚠️ **Warning:** As soon as one curve is manually assigned to an axis, all new curves will be added to the first axis; automatic assignments are therefore off for this plot. Until then, new curves are put on succeeding Y-axes until more than 4 curves are in the plot, upon which all curves are drawn on the first Y-axis.

    - **Everything else:** See [Plot Defaults](#plot-defaults)

- **Y-Axes:** There are at most 4 axes in a plot. These can be configured in here.

    - **#:** The axis to modify

    - **Scaling:** Either linear or logarithmic

    - **Min:** Minimum value displayed on the scale. Leave blank to have it auto-calculated.

    - **Max:** Maximum value displayed on the scale. Leave blank to have it auto-calculated.

    - **Label:** The text displayed on the axis.

#### Activating Correlation

It is possible to correlate one or more channels to a base channel. For this, you can simply change the `Axis` for the desired base channel to "x". All other channels will then be correlated to this one.

#### Hover-Information

When you hover over a data point, you see a little popup with the information for this point. If [correlation is activated](#activating-correlation), you can also see two calculated correlation coefficients for this curve, namely:

- **[Pearson Correlation Coefficient](https://w.wiki/Ksu)**
- **[Spearman's Rank Correlation Coefficient](https://w.wiki/6AM9)**

### Sharing / Saving Stuff

#### Export Settings

The settings can be exported separately to the dashboard.

> _Hint_: The settings are stored locally to the browser, so an export is only needed to transfer settings between browser, or if you delete your browser's cache.

To export the settings, simply open the [settings tab](#settings) and use the button at the bottom called `EXPORT SETTINGS`.

#### Import Settings

To import settings from a JSON file, open the [settings tab](#settings) and use the button at the bottom called `IMPORT SETTINGS`.

#### Save Dashboard to URL

You can save a dashboard to URL by clicking one of the following buttons at the bottom of the plots:

- `SAVE LAYOUT`: Stores a copy of the dashboard to the DataBoard server. The ID of said dashboard is stored in the URL. This button overwrites any other dashboards with that ID, so only use it if you want to overwrite another dashboard.

- `SAVE AS NEW LAYOUT`: Creates a new entry on the DataBoard server and stores a copy of the dashboard there. The ID of this new dashboard entry is saved to the URL.

If a page is loaded and a dashboard ID is present in the URL, it will be fetched from the DataBoard server.

> ⚠️ **Warning:**
>
> - Dashboard storage to DataBoard's server is provided at best-effort. There is absolutely **NO** guarantee that the dashboards will persist. They will most certainly persist for a while, but after some time, when our storage is at capacity, we have to recycle old, dashboards. To save a dashboard for multiple months, [export to JSON](#export-dashboard).
> - Dashboard storage is **NOT** protected. Someone could at any time delete any dashboard, or overwrite any dashboard. This doesn't need to be maliciously, but could also happen accidentally.

#### Export Dashboard

The dashboard layout can be exported to JSON. This is recommended for long-term storage. For this, simply click the `DOWNLOAD LAYOUT AS JSON`-button.

> ⚠️ **Warning:** The timerange is not stored in the layout, only settings specific to the plot.

#### Import Dashboard

A dashboard layout can be imported from a JSON file using the `IMPORT JSON LAYOUT`-button.

### Troubleshooting & Tricks

#### Too many WebGL Contexts?

If your browser yells at you about too many WebGL contexts:

- Try closing other tabs.
- Reduce the number of plots.
- Switch to a different browser.

#### I want to specify my timerange in milliseconds!

This is unfortunately not supported by the timepicker of barely any browser. You **can**, however, specify the milliseconds by adjusting the Unix timestamps in the URL parameters.

---

## 🛠️ Build

### Requirements

- **Node.js:** Make sure you're running a recent version of Node.
- **Dependencies:** Run `npm install` to install all necessary packages.
    > _Note:_ This requires a network connection or a preconfigured mirror to fetch npm packages.

### Running Locally

To run locally, in the file [`public/env-config.js`](./public/env-config.js), define the full URL to a running instance of the backend in the following format:

```js
window._env_ = {
    DATA_BOARD_PUBLIC_BACKEND_URL: "http://localhost:8000",
};
```

> _Hint_: If you don't want to run the backend locally too (easily doable using Docker), you can visit the production instance, and using your browser's dev tools, find the `env-config.js` file the frontend served to your client. Then, simply use that to point to the production instance of the backend. The files are usually in the "Sources" or "Debugger" tab. Alternatively, use the "Network" tab to figure out the URL the requests to the backend go to.

If the [Requirements](#requirements) are met and the [`env-config.js`](./public/env-config.js) is set up, you can now run the application using `npm run dev`.

### Configuration

The application only uses environment variables as defined in [`/public/env-config.js`](./public/env-config.js). You can configure some default values in [`/src/helpers/defaults.ts`](./src/helpers/defaults.ts).

### Build

To create a production build, make sure the [Requirements](#requirements) are met and run `npm run build`.

### Linting / Formatting

Formatting is done via Prettier, using the config in [`.prettierrc`](./.prettierrc). See the docs of your Prettier to see how to use our config for this project.

You can lint the project using `npm run lint`. There should not be any errors; warnings are tolerated if reasonable. New warnings should always be read carefully. Usually, it makes sense to fix them.

### Deployment Notes

For easy deployment/running of the frontend, there is a [`Dockerfile`](./Dockerfile) available in the root directory. In the [Backend Repository](https://github.com/paulscherrerinstitute/data_board_backend), there are Ansible scripts, as well as a [`docker-compose.yml`](https://github.com/paulscherrerinstitute/data_board_backend/blob/main/docker-compose.yml) to deploy both services together.

---

## 🤝 Contributing / Issues

If you find any bugs, please open a GitHub issue.

If you want to add a feature or extend the application in any other way, please get in contact with the current maintainer.

For any contribution to be merged, all pipelines need to be successful, and the linter should not give any errors. (Warnings are tolerated if reasonable)

### 🎨 Adding Custom Themes

Adding a custom theme can be done by opening a PR with the following changes:

1.  **Define the Theme**

    - Create a new file in [`src/themes`](./src/themes) (e.g. `myCustomTheme.ts`)
    - Use [`base.ts`](./src/themes/base.ts) as a reference for structure.
    - If your theme includes a **custom watermark image**, add it to the [`src/media`](./src/media) folder.
        - The watermark can be any file supported by [Plotly](https://plotly.com/javascript/images/).

2.  **Update the Theme Type**

    - Open [`src/themes/themes.types.ts`](./src/themes/themes.types.ts)
    - Add your new theme key to the `AvailableTheme` type:
        ```ts
        export type AvailableTheme = "default" | ... | "yourNewTheme";
        ```

3.  **Extend the `themes.ts` List**

    - Open [`src/themes/themes.ts`](./src/themes/themes.ts)
    - Add your new theme to the `themes` record:

        ```ts
        import myCustomTheme from "./myCustomTheme"; // Import your new theme

        ...

        export const themes: Record<AvailableTheme, { theme: ThemeOptions; displayName: string }> = {
            default: {
                theme: defaultTheme,
                displayName: "Default",
            },
            ...
            myCustomTheme: {
                theme: myCustomTheme,  // Add your theme here
                displayName: "My Custom Theme",  // Set a display name for the theme, which will be displayed in settings
            },
        };
        ```

    And just like that, your new theme should be selectable. Please test it thoroughly before opening the PR; sometimes themes can have quite an impact on performance.

---

## 🆘 Help

If you have a problem that this documentation could not solve, please ask someone you know that also uses DataBoard. If that doesn't get you any further, please contact the current maintainer.

If you are sure your problem is a bug in DataBoard, you can also directly open an issue in GitHub. Either way, for urgent/very important requests, please contact the current maintainer directly.

### 📖 FAQ

> **Q:** Nothing yet  
> **A:** All clear ;)

### ⚠️ Known Issues

> **Performance:** We are aware the website can be slow sometimes. This happens especially with many plots, plotting many curves with a lot of data points. To a certain extent this is natural, due to browser limitations. At the same time, the application could probably be optimized a bit. If you can't stand the performance, feel free to optimize, and open a PR. If you have any _groundbreaking_ ideas that could drastically improve performance (not rewriting it in rust), at best with a little proof-of-concept, feel free to reach out to the current maintainer.

---

### Contact / Support

The current maintainer is Erik Schwarz <erik.schwarz{at}psi.ch>

---
