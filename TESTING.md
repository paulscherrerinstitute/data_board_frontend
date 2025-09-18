# Manual for testing

## Overview

- **Purpose:** Utests to verify the program runs correctly before you publish a new release.
    > ⚠️ **IMPORTANT:** All tests listed here should be fully functional before a new release is pushed:
- **Scope:** Covers most of the features as of [September 2025](https://github.com/paulscherrerinstitute/data_board_frontend/commit/5e49568571d8f703da3956b560b1929abfc3cc7c)
- **OS/Browsers/Devices:**
  Verify that it works on:  
  -> Microsoft Edge,  
  -> Firefox and  
  -> Chrome
- **Prerequisites:** Backend (connected to a mongodb with some example data) and Frontend must be running.

## 3. Tests

The following tests are supposed to provide a comprehensive manual on how the application should be tested.
If you find a major feature or error that is not included into the the testing, feel free to contact the maintainer so that they can be added.

### 3.1 Search for and select channel

#### Description

Tests the ways of how channels are filtered and added to a plot. Verify that every step with a green tick behaves as defined.

#### Steps

1. Open Dashboard
    > ✅ A list of available channels should be displayed.
2. Input a value into the search field
    > ✅ Only the channels matching the value should be displayed
3. Drag a channel by from the list by the 6-points-icon over to the plot on the right side
    > ✅ Channel name, backend and type should be displayed in the legend on the righthand-side and some values should be graphically displayed.  
    > ℹ️ If the channel is in the legend but shows an error, try extending the timespan: Some channels don't have values 24/7.
4. Select another channel by clicking the checkbox and press the button "_Add selected to first plot_"
    > ✅ Channel should appear in the legend and the plot just the same way as if dragged.
5. Reduce the displayed channels either by reloading or restricting the search string.
    > ℹ️ To reduce the time to add all channels, the number should not be too high - reloading reduces the channels in the list to 10. Otherwise, the loading would take centuries...
6. Press the button "_Select All_" to select all currently filtered channels and press the button "_Add selected to first plot_"
    > ✅ All selected channels should be displayed in the legend and in the plot
7. Change filters to a single backend and a single type (f. ex. "_sf-archiver_" and "enum").
    > ✅ Only the channels matching the backend and type should be displayed in the list

#### Expected Result

A channel should be addable to the plots on the right side: Its selection should be filterable and be possible via dragging the element over or by selecting it and pressing "_Add selected to first plot_".

### 3.2 Change settings

#### Description

Tests the settings that can be set for all plots. Verify that every step with a green tick behaves as defined.

#### Steps

> ℹ️ Any settings affecting the plot (like _Watermark opacity_ or alike) can be viewed directly by scrolling down in the menu. There is an example plot showing how the plot will look like after saving the setting. Some settings may take some time or may require a reload of the page.

1. Navigate to the settings by pressing on the ⚙️ in the top left corner.
    > ✅ A dialog should open, named "_Settings_", and should include a bund of dropdowns and inputs.
2. Test the setting "_Initial Sidebar State_" by changing the value and then reloading the page.
    > -> When set to _Always Open_ > ✅ The sidebar should always be open on reload, even after closing.  
    > -> When set to _Always Closed_ > ✅ The sidebar should always be closed on reload, even after opening.  
    > -> When set to _Closed if Dashboard is provided_ > ✅ The sidebar should be open on reload if a layout is currently loaded, otherwise it should be always closed on reload.
3. Test the setting "_Theme_" by changing the dropdown
    > ✅ The settings page should automatically change color to the theme selected. When closing the settings, the entire website should asume the color of the selected theme.
4. Test the setting "_watermark opacity_" by increasing or decreasing its value.
    > ✅ When decreasing, the watermark should become less visible,  
    > ✅ When increasing, it should become better visible.
5. Test the setting "_Plot Background Color_" by changing its color in the picker (do your eyes a favor and don't change it to a blinding pink, your eyes will be thanking you 😭)
    > ✅ Should turn background to the selected color.
6. Test the settings "_X-Axis Grid Color_" and "_Y-Axis Grid color_" by changing it to two different colors in the picker.
    > ✅ X-Axis should turn the color that's been selected
    > ✅ Y-Axis should turn the color that's been selected
7. Test the setting "_Adjust Sidebar Overlap_" by changing the dropdown
    > -> When set to "_Overlap Content_" > ✅ Sidebar should overlap plot if sidebar is extended.  
    > -> When set to "_Move Content_" > ✅ Sidebar should NOT overlap plot if sidebar is extended.
8. Test the setting "_Keep Sidebar Closed after Dragging a Channel_" by changing the dropdown
    > ✅ On "_Enabled_" the Sidebar should close after dragging a channel  
    > ✅ On "_Disabled_" the Sidebar should stay open.
9. Test the setting "_Close Sidebar when Outside is Clicked_" by changing the dropdown
    > ✅ On "_Enabled_" the Sidebar should close after clicking outside of it  
    > ✅ On "_Disabled_" the Sidebar should stay open.
10. Test the setting "_Initial Widget Height_" by changing the height of the initial widget
    > ✅ Should scale the initial widget height when adding a new plot
    > ℹ️ Plot may brake if scale is to low.
11. Test the setting "_Initial Widget Width_" by changing the width of the initial widget
    > ✅ Should scale the initial widget widget when adding a new plot
    > ℹ️ Plot may brake if scale is to low.
12. Test the setting "Curve Color Scheme by changing the color of the first curve
    > ✅ Curve should asume color specified
13. Test the setting "_Y-Axis Scaling_" by changing the dropdown:
    > -> When set to "_Linear_" > ✅ Should look like normal curves
    > -> When set to "_Log10_" > ✅ Curves should look more like logarithmic curves
14. Test the setting "_Curve shape_" by changing the dropdown:
    > -> When set to "_Direct (linear)_" > ✅ Lines between points should be straight
    > -> When set to "_Digital (hv)_" > ✅ Lines between points should be corner-like (horizontal, then vertical movement)
15. Test the setting "_Curve Mode_" by changing the dropdown:
    > -> When set to "_Lines and Markers_" > ✅ Points should be visible (where datapoints are) with lines connecting them.
    > -> When set to "_Only Markers (points)_" > ✅ Only points should be visible
    > -> When set to "_Lines_" > ✅ Only lines should be visible
16. Test "_Reset to defaults_"
    > ✅ All changes made above should be reset
17. Test "_Export Settings_"
    > ✅ A file named "_settings.json_" should automatically be downloaded, containing a json with all settings mentioned above.
18. Test "_Import Settings_" by first makeing some changes to the settings and then importing the exported settings from before.
    > ✅ Settings should be imported according to those in the file.

#### Expected Result

Settings should be changeable and have a noticable effect. Any settings made shall be able to be reset and may be exported and imported.

### 3.3 Change topbar

#### Description

#### Steps

#### Expected Result

### 3.4 Change layout

#### Description

#### Steps

#### Expected Result

### 3.5 Change plot settings

#### Description

#### Steps

#### Expected Result

### 3.6 Download plot data

#### Description

#### Steps

#### Expected Result

## 4. Regression Testing

- Check if upon saving a layout, its "dashboardId" is set into the URL.
- When searching for channels and many channels are displayed, check that no graphical gliches occur (channels behind parant elements etc.)
