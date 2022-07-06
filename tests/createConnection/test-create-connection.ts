import { expect } from "chai";
import { resolve } from "path";

import { SolanaCliConfig } from "@";

function sleep(ms: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

async function checkConn(config: SolanaCliConfig): Promise<void> {
  const conn = config.createConnection();
  // check rpc url with getBalance()
  const balance = await conn.getBalance(config.loadKeypair().publicKey);
  expect(balance).to.eq(0);
  // check websocket url with onSlotChange
  const cbFiredMarker = { fired: false };
  const slotChangeListener = conn.onSlotChange(() => {
    cbFiredMarker.fired = true;
  });
  for (let i = 0; i < 10; i++) {
    if (cbFiredMarker.fired) {
      conn.removeSlotChangeListener(slotChangeListener);
      return;
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(400);
  }
  conn.removeSlotChangeListener(slotChangeListener);
  throw new Error("timeout waiting for onSlotChange callback");
}

describe("test cli config file loading and saving", () => {
  it("Devnet with no ports, derived ws", async () => {
    const cfg = SolanaCliConfig.load(resolve(__dirname, "devnetDerive.yml"));
    await checkConn(cfg);
  });

  it("Devnet with ports, derived ws", async () => {
    const cfg = SolanaCliConfig.load(resolve(__dirname, "devnetNoDerive.yml"));
    await checkConn(cfg);
  });
});
