
#!/bin/sh

# ngrok's web interface is HTML, but configuration is bootstrapped as a JSON
# string. We can hack out the forwarded hostname by extracting the next
# `*.ngrok.io` string from the JSON
#
# Brittle as all get out--YMMV. If you're still reading, usage is:
#
#     $ ./ngrok_hostname.sh <proto> <addr>
#
# To retrieve the ngrok'd URL of an HTTP service running locally on :3332, use:
#
#     $ ./ngrok_hostname.sh http localhost:3332
#

# The protocol (http, https, etc) of the forwarded service
PROTO=$1

# The address of the forwarded service
ADDR=$2

# Hack JSON out of the web interface bootstrap
json=$(curl -s localhost:4040/inspect/http \
  | grep -oP 'window.common[^;]+' \
  | sed 's/^[^\(]*("//' \
  | sed 's/")\s*$//' \
  | sed 's/\\"/"/g')

# Parse JSON for the URLs matching the configured `$ADDR`
hosts=$(echo $json \
  | jq -r ".Session.Tunnels \
    | values \
    | map(select(.Config.addr == \"$ADDR\") | .URL) | .[]")

echo "$hosts" | grep "^${PROTO}:"
