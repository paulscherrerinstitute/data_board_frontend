#!/bin/bash

# First, assemble a script to set all environment variables beginning with DATA_BOARD_PULIC on the client.
# This is done so the app can use environment variables which are not set at built time, but rather when the container is run. 

# Recreate env config file
rm ./env-config.js
touch ./env-config.js

# Add assignment
echo "window._env_ = {" >> ./env-config.js

# Loop through all environment variables
for varname in $(printenv | grep -o 'DATA_BOARD_PUBLIC[^=]*' | sort -u); do
  # Read the value of the environment variable
  value="${!varname}"

  # Append variable name and value to the file
  echo "  $varname: \"$value\"," >> ./env-config.js
done

echo "}" >> ./env-config.js

/configure-backend-proxy.sh

# Execute the command specified as argument to the script
exec "$@"
