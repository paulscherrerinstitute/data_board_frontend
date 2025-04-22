# Schema Generation

To generate the JSON schemas, follow these steps:

1. Install dependencies:
   `npm install`

2. Run the generator:
   `npm run schema`

The schemas will be generated based on the files and types defined in [schema.config.json](schema.config.json). Old schemas will be automatically deleted before the generation process starts.

Note: These schemas must be re-generated before every push to main. The [backend](https://github.com/paulscherrerinstitute/data_board_backend) uses the files pushed to main to validate uploaded dashboards. Do **NOT** change the name or content of any uploaded schema before ensuring the backend works properly with the new version.

> ⚠️ **Warning:** Keep in mind to be backwards compatible when updating the schema. If you make the schema more restrictive, old dashboards may break.
