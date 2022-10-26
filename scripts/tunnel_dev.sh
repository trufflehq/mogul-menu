# set current dirname to root
cd "$(dirname "$0")/.."

# argos tunnel config in /<path to cloudflared>/.cloudflared/config.yml
# tunnel: <tunnel id>
# credentials-file: /<path to cloudflared>/.cloudflared/<tunnel id>.json
# warp-routing:
#   enabled: true
# ingress:
#  - hostname: local-oauth.rileymiller.dev
#    service: http://localhost:50230
#  - hostname: mogul-menu.rileymiller.dev
#    service: http://localhost:50410
#  - service: http_status:404
CLOUDFLARED_CONFIG_PATH=~/.cloudflared/config.yml
PROTO="https://"
# get the oauth frame url
 #MOGUL_MENU_URL=https://mogul-menu.rileymiller.dev/home # "$(curl --silent http://127.0.0.1:4040/api/tunnels | jq '.tunnels[] | select(.name=="mogul-menu").public_url' | sed 's/"//g')/home"
 MOGUL_MENU_ROUTE=home
 MOGUL_MENU_URL="$PROTO$(cat $CLOUDFLARED_CONFIG_PATH | yq '.ingress[0].hostname' | sed 's/"//g')/$MOGUL_MENU_ROUTE"

# OAUTH_URL=https://local-oauth.rileymiller.dev # $(curl --silent http://127.0.0.1:4040/api/tunnels | jq '.tunnels[] | select(.name=="oauth").public_url')
OAUTH_URL="$PROTO$(cat $CLOUDFLARED_CONFIG_PATH | yq '.ingress[1].hostname' | sed 's/"//g')"


if [ -z "$OAUTH_URL" ]; then
    echo "ngrok not running"
    exit 1
fi

echo "MOGUL_MENU_URL: $MOGUL_MENU_URL"
echo "OAUTH_URL: $OAUTH_URL"
LOCAL_OAUTH_FRAME_FILE=components/onboarding/oauth-connection-page/local-oauth-frame.tsx
pwd

sed -i -e "s|const LOCAL_HOSTNAME = .*|const LOCAL_HOSTNAME = \"$OAUTH_URL\"|g"  $LOCAL_OAUTH_FRAME_FILE

echo "replaced url in file"

echo "opening mogul menu in browser $MOGUL_MENU_URL"
open $MOGUL_MENU_URL

NODE_ENV=development PUBLIC_MYCELIUM_API_URL=https://mycelium.staging.bio MYCELIUM_API_URL=https://mycelium.staging.bio truffle-cli dev
