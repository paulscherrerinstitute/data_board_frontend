# Data Board Frontend

This is the frontend for the Data Board project. It is a React application that uses the [Data Board Backend](https://github.com/paulscherrerinstitute/data_board_backend).

---

## 🖥️ Usage

dss

---

## 🛠️ Build

### Requirements

### Running Locally

### Configuration

### Build

### Linting / Formatting

### Deployment Notes

---

## 🤝 Contributing / Issues

If you find any bugs, please open a GitHub issue.

If you want to add a feature, or extend the application in any other way, please get into contact with the current maintainer.

### 🎨 Adding Custom Themes

Adding a custom theme can be done by opening a PR with the following changes:

1.  **Define the Theme**

    - Create a new file in [`src/themes`](./src/themes) (e.g. `myCustomTheme.ts`)
    - Use [`base.ts`](./src/themes/base.ts) as a reference for structure.
    - If your theme includes a **custom watermark image**, add it to the [`src/media`](./src/media) folder.

2.  **Update the Theme Type**

    - Open [`src/themes/themes.types.ts`](./src/themes/themes.types.ts)
    - Add your new theme key to the `AvailableTheme` type:
        ```ts
        export type AvailableTheme = "default" | ... | "yourNewTheme";
        ```

3.  **Extend the `themes.ts` List**

    - Open [`src/themes/themes.ts`](./src/themes/themes.ts)
    - Add your new theme to the `themes` record:

        ````ts
        import myCustomTheme from "./myCustomTheme"; // Import your new theme

               export const themes: Record<AvailableTheme, { theme: ThemeOptions; displayName: string }> = {
                   default: {
                       theme: defaultTheme,
                       displayName: "Default",
                   },
                   ...,
                   myCustomTheme: {
                       theme: myCustomTheme,  // Add your theme here
                       displayName: "My Custom Theme",  // Set a display name for the theme, which will be displayed in settings
                   },
               };
               ```

          And just like that, your new theme should be selectable. Please test it thoroughly before opening the PR; Sometimes themes can have quite an impact on performance.
        ````

The watermark, which has to be defined in the theme, can be any file supported by [Plotly](https://plotly.com/javascript/images/).

---

## 🆘 Help

If you have a problem that this documentation could not solve, please ask someone you know that also uses DataBoard. If that doesn't get get you any further, please contact the current maintainer.

If you are sure your problem is a bug in DataBoard, you can also directly open an Issue in GitHub. Either way, for urgend / very important requests, please contact the current maintainer directly.

### 📖 FAQ

> **Q:** Nothing yet  
> **A:** All clear ;)

### ⚠️ Known Issues

> **Performance:** We are aware the website can be slow sometimes. This applies especially with many plots, plotting many curves with a lot of data points. To a certain extent this is natural, due to browser limitations. At the same time, the application could probably also be optimized a bit. If you can't stand the performance, feel free to optimize, and open a PR. If you have any groundbreaking ideas that could drastically improve performance (not rewriting in rust), at best with a little proof-of-concept, feel free to reach out to the current maintainer.

### Contact / Support

The Current Maintainer is Erik Schwarz <erik.schwarz{at}psi.ch>

---
