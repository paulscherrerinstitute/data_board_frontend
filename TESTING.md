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
- **Prerequisites:** Backend (connected to a mongodb) and Frontend must be running.

## 3. Tests

The following tests are supposed to provide a comprehensive manual on how the application should be tested.
If you find a major feature or error that is not included into the the testing, feel free to contact the maintainer so that they can be added.

### 3.1 Search for channel

#### Description

#### Steps

#### Expected Result

### 3.2 Add channels to plot

#### Description

#### Steps

#### Expected Result

### 3.3 Change default settings

#### Description

#### Steps

#### Expected Result

### 3.4 Change topbar

#### Description

#### Steps

#### Expected Result

### 3.5 Change layout

#### Description

#### Steps

#### Expected Result

### 3.6 Change plot settings

#### Description

#### Steps

#### Expected Result

### 3.7 Download plot data

#### Description

#### Steps

#### Expected Result

## 4. Regression Testing

- Check if upon saving a layout, its "dashboardId" is set into the URL.
