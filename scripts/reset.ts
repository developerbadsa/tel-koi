const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const token = process.env.ADMIN_TOKEN;

if (!token) {
  throw new Error("Missing ADMIN_TOKEN");
}

async function run() {
  const res = await fetch(`${baseUrl}/api/admin/run-daily-reset`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Reset failed: ${JSON.stringify(data)}`);
  }
  console.log("Reset success", data);
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
