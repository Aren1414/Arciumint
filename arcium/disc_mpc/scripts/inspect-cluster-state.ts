import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { getClusterAccAddress } from "@arcium-hq/client";

// تلاش می‌کنیم IDL رسمی arcium را از خود پکیج بیرون بکشیم
function loadArciumIdl(): any {
  // این مسیرها ممکن است بسته به نسخه متفاوت باشند؛ چند مسیر را امتحان می‌کنیم
  const tries = [
    "@arcium-hq/client/build/idl/arcium.json",
    "@arcium-hq/client/build/idl/arcium.idl.json",
    "@arcium-hq/client/idl/arcium.json",
    "@arcium-hq/client/idl/arcium.idl.json",
  ];
  for (const p of tries) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(p);
    } catch {}
  }
  throw new Error("Cannot find Arcium IDL inside @arcium-hq/client. Please show node_modules/@arcium-hq/client/build/idl/ contents.");
}

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const clusterOffset = Number(process.env.CLUSTER_OFFSET ?? "456");
  if (!Number.isFinite(clusterOffset)) throw new Error("CLUSTER_OFFSET invalid");

  const conn: Connection = provider.connection;
  const clusterPk = getClusterAccAddress(clusterOffset);

  const info = await conn.getAccountInfo(clusterPk, "confirmed");
  if (!info) throw new Error("Cluster account not found");

  const idl = loadArciumIdl();
  const coder = new anchor.BorshAccountsCoder(idl);

  // اسم اکانت در IDL ممکن است ClusterAccount یا Cluster
  const nameCandidates = ["ClusterAccount", "Cluster", "clusterAccount", "cluster"];
  let decoded: any = null;
  let usedName: string | null = null;

  for (const name of nameCandidates) {
    try {
      decoded = coder.decode(name, info.data);
      usedName = name;
      break;
    } catch {}
  }

  if (!decoded) {
    console.log("Failed to decode cluster with candidates:", nameCandidates);
    console.log("DATA_LEN:", info.data.length);
    console.log("DATA_HEX:", Buffer.from(info.data).toString("hex"));
    process.exit(2);
  }

  console.log("CLUSTER_OFFSET:", clusterOffset);
  console.log("CLUSTER_PUBKEY:", clusterPk.toBase58());
  console.log("DECODED_AS:", usedName);
  console.dir(decoded, { depth: null });
}

main().catch((e) => {
  console.error("ERROR:", e?.message ?? e);
  process.exit(1);
});
