# Data Board Frontend

This is the frontend for the Data Board project. It is a React application written in TypeScript that uses the [Data Board Backend](https://github.com/paulscherrerinstitute/data_board_backend).

---

## 🖥️ Usage

To be done...

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

> _Hint_: If you don't want to run the backend locally too (easily doable using Docker, but requires PSI network), you can visit the production instance, and using your browser's dev tools, find the `env-config.js` file the frontend served to your client. Then, simply use that to point to the production instance of the backend. The files are usually in the "Sources" or "Debugger" tab. Alternatively, use the "Network" tab to figure out the URL the requests to the backend go to.

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

    And just like that, your new theme should be selectable. Please test it thoroughly before opening the PR; sometimes themes can have quite an impact on performance.

---

## 🆘 Help

If you have a problem that this documentation could not solve, please ask someone you know that also uses DataBoard. If that doesn't get you any further, please contact the current maintainer.

If you are sure your problem is a bug in DataBoard, you can also directly open an issue in GitHub. Either way, for urgent / very important requests, please contact the current maintainer directly.

### 📖 FAQ

> **Q:** Nothing yet  
> **A:** All clear ;)

### ⚠️ Known Issues

> **Performance:** We are aware the website can be slow sometimes. This happens especially with many plots, plotting many curves with a lot of data points. To a certain extent this is natural, due to browser limitations. At the same time, the application could probably be optimized a bit. If you can't stand the performance, feel free to optimize, and open a PR. If you have any _groundbreaking_ ideas that could drastically improve performance (not rewriting it in rust), at best with a little proof-of-concept, feel free to reach out to the current maintainer.

---

### Contact / Support

The current maintainer is Erik Schwarz <erik.schwarz{at}psi.ch>

---
