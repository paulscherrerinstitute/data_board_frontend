![Version](https://img.shields.io/github/release/paulscherrerinstitute/data_board_frontend.svg)
![Issues](https://img.shields.io/github/issues/paulscherrerinstitute/data_board_frontend)
![Lint and Test](https://img.shields.io/github/actions/workflow/status/paulscherrerinstitute/data_board_frontend/lint-test.yml?branch=main&label=tests&logo=github)
![Build Status](https://img.shields.io/github/actions/workflow/status/paulscherrerinstitute/data_board_frontend/docker-image.yml?branch=main&label=build&logo=github)

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

0. Mark it (and some more) as selected using the checkbox in the sidebar, and add them to the first plot by using the button beside the select all checkbox.

1. Mark it (and some more) as selected, and drag any one of those to the target destination.

2. Directly drag it to the target destination. The channel becomes selected for the duration of the drag and gets unselected right after. This way, other selected channels are also dragged.

3. Drag a channel from the legend of a plot containing it to the destination. The source plot will keep its channel.

The destination can be one of the following:

1. An existing plot; this will simply add the channel(s) to the plot.

2. The button at the bottom of the plots, containing a plus. This will create a new plot with the dragged channel(s).

3. If your browser supports it, you can also drag the channel outside of the browser tab and, e.g., drop it into a notepad app.
    > _Hint_: You can also do the inverse if your browser supports it (add channels by dragging from outside the browser); the DragEvent utilises simple text data.

You can also [define initial channels](#initial-channels) for the first plot.

### Initial Channels

It is possible to define initial channels in the url, which will directly be loaded into the first plot, as long as no dashboard is provided. (A dashboard will make initial channels be ignored.)

This is meant for script usage, e.g. if you want to hook a script to a button press, which will then launch the webpage with the defined channels.

You can define up to 10 initial channels by setting url parameters in the following format:

- `init_c` => channel name
- `init_b` => corresponding backend name
- `init_c0` - `init_c9` => indexed channel name (use for multiple channels)
- `init_b0` - `init_b9` => indexed backend name

Note that indexed keys overwrite non-indexed keys, so init_c0 will be used instead of init_c and init_b0 will be used instead of init_b.

To also make the sidebar be collaped on load, you may specify the `closeSidebar` url parameter to any arbitrary non null value. So setting it to false will do the same as true, it is only checked if this url parameter is defined. This parameter overwrites any [settings](#settings) defining the sidebar state otherwise.

### Set Query Parameters

The query parameters are defined for all plots and can be set in the topbar.

- **Timerange:** The timerange can be defined using local time. If your browser's date/time picker doesn't support seconds, you can click in the text field and set the seconds there.

    > ⚠️ **Important:** The time displayed in the plots will also be in **local time**, _not_ UTC!

<span id="undo-redo-timerange"></span>

- **Undo / Redo Timerange:** Using the arrow buttons to the right of the end time field, you can switch to the previously set timerange. This will **immediately** apply and not have an effect on other query parameters. These arrow buttons are only shown if switching between timeranges is possible, e.g. if you have not selected a timerange more than once, there will be no arrow buttons. If you undo / redo a timerange, it **will** reset the quickselect option to unselected.

    > 💡 **Tip:** You can also switch between timeranges using `control` + `z` and `control` + `y`

- **Quick Select:** You can also utilise quick select to get an absolute timestamp for relative time. If you apply the query parameters, relative times will be recalculated, if quick select is active.

- **Raw when sparse:** This toggle defines if the curves should be drawn using raw data if there are not enough points for binned data. This simply removes unnecessary min/max curves and is highly recommended to stay activated.

- **Remove empty bins:** Traditionally, if a bin has no data in it, the bin will have no min or max but a value, and this is taken from the last bin that has data. This can be seen as duplicated (and undesirable) data points, but it could also be argued to be logical, as some may wish to assume that the data remains as it was previously if no event indicating otherwise has occurred. This toggle specifies whether such "duplicated" data points should be displayed or filtered out (removed).

- **Auto Apply:** This can be used if you have relative timestamps (using Quick Select) or simply want to refetch the data from time to time. It displays a status bar until the next press and then simulates a press of the `APPLY`-button.

To apply query parameters, you have to click the `APPLY`-button. Or, activating auto-apply also does the job.

### Arrange Plot Dashboard

- New plots can be created using the button at the bottom of the plots, with the plus on it.

- You can delete plots by clicking the round icon with the "x" on them at the very top right of any plot.

- You can also [import](#import-dashboard) or [export](#export-dashboard) dashboards.

    #### Layouting Mode

    You can toggle the layouting mode by clicking the button in the bottom right, overlaying the dashboard. In this mode:

    - Plots can be arranged using drag and drop, but make sure not to drag the canvas or legend. It is easiest to drag the bottom of the plot, for example, by the X-axis title.

    - Plots can be resized within the plotting area by dragging one of the marked corners of the plot.

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
  <span id="use-webgl"></span>
- **Use WebGL:** Decides whether or not the graphics card should be used to render curves. Highly recommended, it allows for somewhat performant rendering of even bigger curves.
  <span id="use-virtual-webgl-contexts"></span>
- **Use Virtual WebGL Contexts:** Since the number of WebGL contexts (proportional to the number of plots) is limited on most browsers, they might break if too many plots are drawn. As a workaround, this setting can be enabled to make all plots share one WebGL context.

    > ⚠️ **Warning:** This setting is an experimental _workaround_ and may break the plotting.

- **Keep Sidebar Closed after Dragging a Channel**
  If this is enabled, the sidebar will stay closed after one or multiple channels have been dragged. (It is closed upon starting the drag to make plots visible currently under the sidebar). The sidebar will stay closed, no matter what happend with the dragged channels. So even if they were not dragged into a plot, the sidebar will stay closed until it is opened again manually.
- **Close Sidebar when Outside is Clicked**
  This setting decides whether or not the sidebar should be closed if the user clicks anywhere outside of the sidebar. The general settings popup is exempt from this and will not trigger a sidebar collapse.
- **Initial Widget Height / Width:** Initial dimensions new plots take when they are created. Does not affect the very first plot.

#### Plot Defaults

The plot default section contains settings which are also applied to all plots, but can be overwritten for each plot individually, using [plot specific settings](#plot-specific-settings). As long as such a setting isn't explicitly defined for a plot, the default value will be used.

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

In these settings, you can define properties that only affect the current plot, and are saved to the dashboard. If a setting isn't explicitly saved, its value will be displayed normally. If you [share](#sharing--saving-stuff) a plot, other people might have different values for non-explicitly-defined settings. The displayed value is simply the default value taken from your [plot default settings](#plot-defaults). Settings that are explicitly configured are displayed in a **bold font**. If a color has been explicitly selected for a curve, its color selector will have a black frame. Using the button at the bottom, you can unset all settings, so the default values are taken again.

> _Hint_: If you explicitly want to select a setting that is already the default, clicking it while it's already selected (by default) won't do anything. For that, you have to select another option first (which enables explicit mode for this setting), and then re-select the desired option.

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
    - **Min:** Minimum value displayed on the scale. Leave blank to have it auto-calculated. If the axis is logarithmic (log10), it will be interpreted as a power of ten.
    - **Max:** Maximum value displayed on the scale. Leave blank to have it auto-calculated. If the axis is logarithmic (log10), it will be interpreted as a power of ten.
    - **Label:** The text displayed on the axis.
        > 💡 **Tip:** You can also set the axis limits (Min/Max) by clicking the top/bottom of an axis. Limits set this way are saved as if they were set via the settings.

#### Activating Correlation

It is possible to correlate one or more channels to a base channel. For this, you can simply change the `Axis` for the desired base channel to "x". All other channels will then be correlated to this one.

#### Hover-Information

When you hover over a data point, you see a little popup with the information for this point. If [correlation is activated](#activating-correlation), you can also see two calculated correlation coefficients for this curve, namely:

- **[Pearson Correlation Coefficient](https://w.wiki/Ksu)**
- **[Spearman's Rank Correlation Coefficient](https://w.wiki/6AM9)**

#### Requery on Zoom

If you hold `control` while zooming in, the timerange you zoomed to will be applied as the selected timerange. This **will** affect other plots. You then can't simply zoom back again, this new zoom will be the new base zoom.

#### Viewing Waveforms

Waveform only show the waveform's average by default, thus behaving like regular binned curves. It is not intended to mix waveform channels with regular channels in a plot. This is not actively disabled, but also not supported.

##### **Waveform Preview**

When a point of a waveform curve in its binned representation is clicked and the number of waveform points under the clicked point is reasonably small (See console.log output on the browser for this limit if it is reached), a popup window will open above the plot, allowing you to preview all raw waveforms under that point. If it only one waveform, it will be displayed as a regular curve.

When there are multiple waveforms:

- If [WebGL](#use-webgl) is enabled: a 3D plot will be rendered where you can view all waveforms. On hover you see more information about each point.
- Otherwise: a heatmap will be drawn with each waveform's data in it.

##### **Zoom to Waveform**

If you zoom in enough on the time axis ([while holding control](#requery-on-zoom)), such that only one waveform corresponds to the current timerange, it will be displayed instead of its binned point.

This is effective when paired together with [undoing the timerange](#undo-redo-timerange). This way, you can [control zoom](#requery-on-zoom) in on a single waveform, and then [undo the zoom](#undo-redo-timerange) again to get back to the binned representation, enabling you to zoom in on another waveform.

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

- `SAVE AS NEW LAYOUT`: Creates a new entry on the DataBoard server and stores a copy of the dashboard there. The ID of this new dashboard entry is saved to the URL as `dashboardId`.

If a page is loaded and a dashboard ID is present in the URL, it will be fetched from the DataBoard server.

> ⚠️ **Warning:**
>
> - Dashboard storage to DataBoard's server is provided at best-effort. There is absolutely **NO** guarantee that the dashboards will persist. They will most certainly persist for a while, but after some time, when our storage is at capacity, we have to recycle old dashboards. To save a dashboard for multiple months, [export to JSON](#export-dashboard).
> - Dashboard storage is **NOT** protected. Someone could at any time delete any dashboard, or overwrite any dashboard. This doesn't need to be maliciously, but could also happen accidentally.
>     - To help detect if a dashboard retrieved from the DataBoard server has been modified, they are hashed upon save. This hash is then stored in the URL as `dashboardHash`.
>     - When an URL is loaded that contains a this hash parameter (and obviously a `dashboardId`), the hash is compared to the retrieved data, and an error id displayed if there is a mismatch. If the hash matches, you get a success message after the stored dashboard has been retrieved. This way, you can be sure the retrieved dashboard is still in the state you saved it as, and was not overwritten externally.
>     - The hash stored in the URL is updated if you save the dashboard layout again, either as a new entry on the Server, or to overwrite an existing one.
> - If you believe your dashboard is so important, it should always take priority when the backend cache is being cleaned, and should not be auto-deleted to save space (think control room panels or similar), please get in touch with the [current maintainer](#contact--support). It is possible to whitelist individual dashboards from auto-deletion.

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
- Enable [virtual WebGL contexts](#use-virtual-webgl-contexts) if you really need this many contexts.

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

### Generating Schemas

See [here](./schema/README.md)

### Deployment Notes

For easy deployment/running of the frontend, there is a [`Dockerfile`](./Dockerfile) available in the root directory. In the [Backend Repository](https://github.com/paulscherrerinstitute/data_board_backend), there are Ansible scripts, as well as a [`docker-compose.yml`](https://github.com/paulscherrerinstitute/data_board_backend/blob/main/docker-compose.yml) to deploy both services together.

---

## 🤝 Contributing / Issues

If you find any bugs, please open a GitHub issue.

If you want to add a feature or extend the application in any other way, please get in contact with the [current maintainer](#contact--support).

For any contribution to be merged, all pipelines need to be successful, and the linter should not give any errors. (Warnings are tolerated if reasonable). Additionally, all new features need to be documented here.

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

If you have a problem that this documentation could not solve, please ask someone you know that also uses DataBoard. If that doesn't get you any further, please contact the [current maintainer](#contact--support).

If you are sure your problem is a bug in DataBoard, you can also directly open an issue in GitHub. Either way, for urgent/very important requests, please contact the [current maintainer](#contact--support) directly.

### 📖 FAQ

> **Q:** When adding / removing a curve, other curves disappear!  
> **A:** If this changes the axis assignments of the curves, it might be a curve is assigned to an axis, on which custom limits are defined, outside of the visible domain for this curve. Make sure to check the [plot settings](#plot-specific-settings) for any weird limits.

> **Q:** The [old interface](https://data-ui.psi.ch) could render more points / was faster / displayed better data!  
> **A:** A big reason for this application to be created was the old archiver interface (used by data-ui) becoming obsolete. This means this application uses a different backend ([Data-API v4](https://data-api.psi.ch/api/4/docs/index.html) via [datahub](https://github.com/paulscherrerinstitute/datahub)). Thus, the data is coming from another provider, providing it differently. Unfortunately there is nothing we can do about that here.

### ⚠️ Known Issues

> **Performance:** We are aware the website can be slow sometimes. This happens especially with many plots, plotting many curves with a lot of data points. To a certain extent this is natural, due to browser limitations. At the same time, the application could probably be optimized a bit. If you can't stand the performance, feel free to optimize, and open a PR. If you have any _groundbreaking_ ideas that could drastically improve performance (not rewriting it in rust), at best with a little proof-of-concept, feel free to reach out to the [current maintainer](#contact--support).

> **Plot disappears when previewing waveforms:** When [previewing waveforms](#waveform-preview), it can happen that the original plot seems to disappear. It is shown again on rerender, caused e.g. by resetting the zoom (double-click). This behaviour is caused by plotly spawning a new WebGL context for each plot, including the waveform-previews. When those aren't disposed properly, too many will be active at a time, causing the oldest to be destroyed, which can be the original plot. In short: The waveform-previews overload the browsers graphics-engine. To workaround this, you could either turn off [WebGL](#use-webgl) (not recommended) or enable [virtual WebGL contexts](#use-virtual-webgl-contexts) (recommended).

---

### Contact / Support

The current maintainer is Erik Schwarz <erik.schwarz{at}psi.ch>

---

<div style="text-align: center; margin-top: 20px;">
  <img src="public/logo512.png" alt="DataBoard Logo" />
</div>
