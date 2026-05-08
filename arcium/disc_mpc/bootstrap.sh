set -a
source /workspaces/Arciumint/arcium/disc_mpc/.env.local
set +a

export ANCHOR_PROVIDER_URL="${ANCHOR_PROVIDER_URL:-$RPC_URL}"
export ANCHOR_WALLET="${ANCHOR_WALLET:-$HOME/.config/solana/id.json}"
